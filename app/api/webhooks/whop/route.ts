import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { WhopServerSdk } from "@whop/api";

const whopApi = WhopServerSdk({
  appApiKey: process.env.WHOP_API_KEY!,
  appId: process.env.NEXT_PUBLIC_WHOP_APP_ID!,
});

/**
 * Webhook handler for Whop events
 * 
 * Subscribe to these events in Whop Dashboard:
 * - app.install - When user installs your app
 * - order.created - When user subscribes/purchases
 * - order.cancelled - When subscription is cancelled
 * - order.expired - When subscription expires
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const eventType = body.type || body.event;
    
    console.log("Whop webhook received:", eventType);

    switch (eventType) {
      case "app.install":
        await handleAppInstall(body);
        break;
      
      case "order.created":
      case "order.updated":
        await handleOrderCreated(body);
        break;
      
      case "order.cancelled":
      case "order.expired":
        await handleOrderCancelled(body);
        break;
      
      default:
        console.log("Unhandled webhook event:", eventType);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleAppInstall(data: any) {
  const customerId = data.customer_id || data.customer?.id || data.user_id;
  const userData = data.user || data.customer || {};
  
  if (!customerId) {
    console.error("No customer ID in app.install webhook");
    return;
  }

  console.log("Handling app install for customer:", customerId);

  try {
    await prisma.user.upsert({
      where: { whopCustomerId: customerId.toString() },
      update: {
        email: userData.email || undefined,
        name: userData.username || userData.name || undefined,
        avatarUrl: userData.profile_image_url || userData.avatar_url || undefined,
      },
      create: {
        whopCustomerId: customerId.toString(),
        email: userData.email || null,
        name: userData.username || userData.name || userData.email || null,
        avatarUrl: userData.profile_image_url || userData.avatar_url || null,
      },
    });
    
    console.log("User updated from app.install webhook");
  } catch (error) {
    console.error("Error handling app.install:", error);
  }
}

async function handleOrderCreated(data: any) {
  const customerId = data.customer_id || data.customer?.id || data.user_id;
  const order = data.order || data;
  const planId = order.plan_id || order.plan?.id;
  const status = order.status || "active";
  const expiresAt = order.expires_at || order.access_expires_at;

  if (!customerId) {
    console.error("No customer ID in order.created webhook");
    return;
  }

  console.log("Handling order created for customer:", customerId, "Plan:", planId);

  try {
    // Find user by Whop customer ID
    const user = await prisma.user.findUnique({
      where: { whopCustomerId: customerId.toString() },
    });

    if (!user) {
      console.error("User not found for customer ID:", customerId);
      return;
    }

    // Upsert membership
    await prisma.membership.upsert({
      where: { userId: user.id },
      update: {
        whopPlanId: planId?.toString() || null,
        status: status as any,
        accessExpiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      create: {
        userId: user.id,
        whopPlanId: planId?.toString() || null,
        status: status as any,
        accessExpiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    console.log("Membership updated from order.created webhook");
  } catch (error) {
    console.error("Error handling order.created:", error);
  }
}

async function handleOrderCancelled(data: any) {
  const customerId = data.customer_id || data.customer?.id || data.user_id;

  if (!customerId) {
    console.error("No customer ID in order.cancelled webhook");
    return;
  }

  console.log("Handling order cancelled for customer:", customerId);

  try {
    const user = await prisma.user.findUnique({
      where: { whopCustomerId: customerId.toString() },
    });

    if (!user) {
      console.error("User not found for customer ID:", customerId);
      return;
    }

    // Update membership status to cancelled or expired
    await prisma.membership.updateMany({
      where: { userId: user.id },
      data: {
        status: "canceled" as any,
      },
    });

    console.log("Membership cancelled from webhook");
  } catch (error) {
    console.error("Error handling order.cancelled:", error);
  }
}

// Support GET for webhook verification (if Whop requires it)
export async function GET() {
  return NextResponse.json({ status: "ok" });
}


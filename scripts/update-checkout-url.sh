#!/bin/bash

# Script to update Whop checkout URL in .env.local

CHECKOUT_URL="https://whop.com/checkout/plan_GKSAvo4qoQDGU?d2c=true"

echo "🔧 Updating checkout URL in .env.local..."
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local not found!"
    echo "Creating .env.local with checkout URL..."
    echo ""
    echo "WHOP_CHECKOUT_URL=$CHECKOUT_URL" > .env.local
    echo "NEXT_PUBLIC_WHOP_CHECKOUT_URL=$CHECKOUT_URL" >> .env.local
    echo "✅ Created .env.local with checkout URL"
else
    # Update existing .env.local
    if grep -q "WHOP_CHECKOUT_URL=" .env.local; then
        # Update existing line
        sed -i.bak "s|WHOP_CHECKOUT_URL=.*|WHOP_CHECKOUT_URL=$CHECKOUT_URL|g" .env.local
        echo "✅ Updated WHOP_CHECKOUT_URL"
    else
        # Add new line
        echo "WHOP_CHECKOUT_URL=$CHECKOUT_URL" >> .env.local
        echo "✅ Added WHOP_CHECKOUT_URL"
    fi
    
    if grep -q "NEXT_PUBLIC_WHOP_CHECKOUT_URL=" .env.local; then
        # Update existing line
        sed -i.bak "s|NEXT_PUBLIC_WHOP_CHECKOUT_URL=.*|NEXT_PUBLIC_WHOP_CHECKOUT_URL=$CHECKOUT_URL|g" .env.local
        echo "✅ Updated NEXT_PUBLIC_WHOP_CHECKOUT_URL"
    else
        # Add new line
        echo "NEXT_PUBLIC_WHOP_CHECKOUT_URL=$CHECKOUT_URL" >> .env.local
        echo "✅ Added NEXT_PUBLIC_WHOP_CHECKOUT_URL"
    fi
    
    # Remove backup file if created
    [ -f ".env.local.bak" ] && rm .env.local.bak
    
    echo ""
    echo "✅ Checkout URL updated successfully!"
fi

echo ""
echo "📋 Updated URL: $CHECKOUT_URL"
echo ""
echo "🔄 Please restart your dev server:"
echo "   npm run dev"
echo ""


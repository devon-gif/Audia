/**
 * POST /api/subscriptions
 *
 * Subscribe a user to Auto-Distill for a podcast feed with preferred summary length.
 * Requires authentication.
 */

import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { feedUrl, podcastName, preferredLength = '5m' } = body;
    
    // Validate required fields
    if (!feedUrl || !podcastName) {
      return NextResponse.json(
        { error: "Missing required fields: feedUrl and podcastName" },
        { status: 400 }
      );
    }
    
    // Validate preferred_length
    const validLengths = ['3m', '5m', '10m'];
    if (!validLengths.includes(preferredLength)) {
      return NextResponse.json(
        { error: "Invalid preferredLength. Must be one of: 3m, 5m, 10m" },
        { status: 400 }
      );
    }
    
    // Check if subscription already exists
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("feed_url", feedUrl)
      .single();
    
    if (existingSub) {
      // Update existing subscription with new preferred length
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({ 
          preferred_length: preferredLength,
          updated_at: new Date().toISOString()
        })
        .eq("id", existingSub.id);
      
      if (updateError) {
        console.error("Error updating subscription:", updateError);
        return NextResponse.json(
          { error: "Failed to update subscription" },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: "Subscription updated successfully",
        subscription: {
          feedUrl,
          podcastName,
          preferredLength
        }
      });
    }
    
    // Create new subscription
    const { error: insertError } = await supabase
      .from("subscriptions")
      .insert({
        user_id: user.id,
        feed_url: feedUrl,
        podcast_name: podcastName,
        preferred_length: preferredLength,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (insertError) {
      console.error("Error creating subscription:", insertError);
      return NextResponse.json(
        { error: "Failed to create subscription" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Subscribed successfully",
      subscription: {
        feedUrl,
        podcastName,
        preferredLength
      }
    });
    
  } catch (error) {
    console.error("Error in subscriptions API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/subscriptions
 *
 * Unsubscribe a user from Auto-Distill for a podcast feed.
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { feedUrl } = body;
    
    if (!feedUrl) {
      return NextResponse.json(
        { error: "Missing required field: feedUrl" },
        { status: 400 }
      );
    }
    
    // Delete subscription
    const { error: deleteError } = await supabase
      .from("subscriptions")
      .delete()
      .eq("user_id", user.id)
      .eq("feed_url", feedUrl);
    
    if (deleteError) {
      console.error("Error deleting subscription:", deleteError);
      return NextResponse.json(
        { error: "Failed to unsubscribe" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Unsubscribed successfully"
    });
    
  } catch (error) {
    console.error("Error in subscriptions API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

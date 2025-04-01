// app/api/auth/token/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get the authorization code from the request body
    const data = await request.json();
    const { code } = data;

    if (!code) {
      return NextResponse.json(
        { error: "Authorization code is required" },
        { status: 400 }
      );
    }

    // Exchange the code for tokens via server-to-server request
    const tokenResponse = await fetch("http://localhost:3000/api/auth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add client authentication (in a production app, use environment variables)
        Authorization:
          "Basic " +
          Buffer.from("anychat_client:anychat_secret").toString("base64"),
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: "http://localhost:3010/auth/callback",
      }),
    });

    if (!tokenResponse.ok) {
      console.error("Token exchange failed:", await tokenResponse.text());
      return NextResponse.json(
        { error: "Failed to exchange code for token" },
        { status: 401 }
      );
    }

    // Get the tokens from the response
    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // Calculate expiration timestamp
    const expiresAt = Date.now() + expires_in * 1000;

    // Return tokens to the client for now
    // In a production app, these should be stored in a server-side session instead
    return NextResponse.json({
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt,
    });
  } catch (error) {
    console.error("Error in token exchange:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

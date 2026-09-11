export async function onRequestPost(context) {
    try {
        // 1. Parse incoming form data
        const data = await context.request.json();
        
        const name = data.name || 'No Name Provided';
        const email = data.email || 'No Email Provided';
        const phone = data.phone || 'No Phone Provided';
        const business = data['business-type'] || 'Not Specified';
        const message = data.message || 'No Message Provided';
        const optIn = data.SMS_Opt_In === 'on' ? 'Yes' : 'No';

        // 2. Format the email content
        const emailContent = `
New Lead from Deep Sea Digital Website!

Name: ${name}
Email: ${email}
Phone: ${phone}
Business Type: ${business}
SMS Opt-In: ${optIn}

Message:
${message}
        `;

        // 3. Read API Key securely from Cloudflare Environment Variables
        const RESEND_API_KEY = context.env.RESEND_API_KEY;

        if (!RESEND_API_KEY) {
            throw new Error("RESEND_API_KEY environment variable is not set in Cloudflare.");
        }

        const resendResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${RESEND_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: "Deep Sea Lead <onboarding@resend.dev>",
                to: ["talondelatorre7@gmail.com"],
                reply_to: email,
                subject: `New Lead: ${name} (${business})`,
                text: emailContent
            })
        });

        if (resendResponse.ok) {
            return new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: { "Content-Type": "application/json" }
            });
        } else {
            const errorText = await resendResponse.text();
            throw new Error(`Resend Error: ${errorText}`);
        }

    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
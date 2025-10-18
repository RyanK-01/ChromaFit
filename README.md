# ChromaFit

ChromaFit is a web application designed to provide AI-powered styling recommendations, explore fashion trends, and manage virtual wardrobes. This guide will help users set up the project and run it locally.

---

## **Setup Requirements**

To use ChromaFit, you need the following APIs and environment variables configured in the `.env.local` file:

### **Required Environment Variables**
1. **OpenAI API Key**:
   - `OPENAI_API_KEY`: Your OpenAI API key for AI-powered styling and trend exploration.

2. **Google Programmable Search Engine (PSE)**:
   - `GOOGLE_PSE_API_KEY`: API key for Google Custom Search.
   - `GOOGLE_PSE_ENGINE_ID`: Search engine ID for fetching fashion trends.

3. **Supabase Credentials**:
   - `SUPABASE_URL`: URL for your Supabase instance.
   - `SUPABASE_KEY`: API key for Supabase.

### **Where to Place the `.env.local` File**
- Create a file named `.env.local` in the root directory of the project.
- Add the required environment variables to this file.

Example `.env.local` file:
```env
OPENAI_API_KEY=your_openai_api_key
GOOGLE_PSE_API_KEY=your_google_pse_api_key
GOOGLE_PSE_ENGINE_ID=your_google_pse_engine_id
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

---

## **Running the Project**

Once the environment variables are set up, follow these steps to run the project:

1. **Install Dependencies**:
   Run the following command to install all required dependencies:
   ```bash
   npm install
   ```

2. **Start the Development Server**:
   Run the following command to start the server:
   ```bash
   npm run dev
   ```

3. **Access the Application**:
   Open your browser and navigate to:
   - **Localhost**: [http://localhost:3000](http://localhost:3000)
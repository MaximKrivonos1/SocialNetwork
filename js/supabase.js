const SUPABASE_URL = 'https://lzyxujefgydzrawjcxqh.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6eXh1amVmZ3lkenJhd2pjeHFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NTMwNjksImV4cCI6MjA3ODQyOTA2OX0.BGUyP71J-rRdl-6V-oDfOLvXVr6z3X2Ow0BvzW3Sd0k'; // Ваш Anon/Public Key

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
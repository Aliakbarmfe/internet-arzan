const DB_URL = "https://internet-arzan-default-rtdb.firebaseio.com";

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { action, username, password, operator } = req.method === 'POST' ? req.body : req.query;

    // ۱. ثبت‌نام کاربر جدید
    if (action === 'register' && req.method === 'POST') {
      if (!username || !password) {
        return res.status(400).json({ error: 'نام کاربری و رمز عبور الزامی است.' });
      }
      
      const userCheck = await fetch(`${DB_URL}/users/${username}.json`);
      const existingUser = await userCheck.json();
      
      if (existingUser) {
        return res.status(400).json({ error: 'این نام کاربری از قبل وجود دارد.' });
      }

      await fetch(`${DB_URL}/users/${username}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      return res.status(200).json({ success: true, message: 'ثبت‌نام با موفقیت انجام شد.' });
    }

    // ۲. ورود کاربر
    if (action === 'login' && req.method === 'POST') {
      if (!username || !password) {
        return res.status(400).json({ error: 'نام کاربری و رمز عبور الزامی است.' });
      }

      const userCheck = await fetch(`${DB_URL}/users/${username}.json`);
      const user = await userCheck.json();

      if (!user || user.password !== password) {
        return res.status(400).json({ error: 'نام کاربری یا رمز عبور اشتباه است.' });
      }

      return res.status(200).json({ success: true, message: 'ورود موفقیت‌آمیز بود.' });
    }

    // ۳. دریافت بسته‌ها (mci یا irancell)
    if (action === 'getPackages' && req.method === 'GET') {
      if (!operator) {
        return res.status(400).json({ error: 'اپراتور مشخص نشده است.' });
      }

      const response = await fetch(`${DB_URL}/packages/${operator}.json`);
      const packages = await response.json();

      return res.status(200).json({ packages: packages || {} });
    }

    return res.status(400).json({ error: 'درخواست نامعتبر است.' });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

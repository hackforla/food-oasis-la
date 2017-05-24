---
layout: default
title: Add Healthy Food Location, Food Oasis Los Angeles
---

<h1>Add a Healthy Food Location</h1>

<!--
Before sign in
-->
<section id="loginSection">  
  <p>
    <a class="action" id="login" href="https://github.com/login/oauth/authorize?client_id=7ebf83bd679d38d56577&amp;scope=public_repo">Sign in with GitHub</a>        
  </p>
</section>

<section class="success hidden" role="status" id="messageSection">      
</section>

<!--
After sign in
-->
<section id="inputSection" class="hidden">  
    <p>
      <label>
        <span class="label">Hi, <span id="userNameSpan">friend</span>! Add a healthy food location:</span><br />
        <textarea id="userText">

Enter data here!

      </label>
    </p>

    <p>
      <button id="submit">Add Location</button>
    </p>  
</section>

<script src="/assets/js/github-backend.js"></script>

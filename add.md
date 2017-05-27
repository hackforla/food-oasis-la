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
        <input type="text" id="locationTitle" placeholder="Location Title">
        <textarea id="userText">
---
name: Everytable
address_1: 1101 West 23rd Street
address_2:
city: Los Angeles
state: California
zipcode: 90007
phone: 213-973-5095
website: https://www.everytable.com

daily: true
daily_open: 8am
daily_close: 11pm

day1:
day1_open:
day1_close:
day2:
day2_open:
day2_close:
day3:
day3_open:
day3_close:
day4:
day4_open:
day4_close:
day5:
day5_open:
day5_close:
day6:
day6_open:
day6_close:
day7:
day7_open:
day7_close:

---

      </textarea>
      </label>
    </p>

    <p>
      <button id="submit">Add Location</button>
    </p>  
</section>

<script src="/assets/js/github-backend.js"></script>

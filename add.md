---
layout: default
title: Add Healthy Food Location, Food Oasis Los Angeles
---

<h1>Add a Healthy Food Location</h1>

<!--
Before sign in
-->
<section id="loginSection">
  <p>Create a free account on <a href="https://github.com">GitHub</a>, and then add a new location on the <a href="/locations/">map</a>!</p>
  <p class="action">
    <a id="login" href="https://github.com/login/oauth/authorize?client_id=7ebf83bd679d38d56577&amp;scope=public_repo">Start</a>        
  </p>
</section>

<!--
After sign in
-->
<section id="inputSection" class="hidden">
  <h2>
    <span class="label">Hi, <span id="userNameSpan">friend</span>!</span>
  </h2>
  <p>Please complete this form, to add a new location on the <a href="/locations/">map</a>!</p>
  <form id="addForm" action="/add" method="post" style="margin-top: 3em;">
    <p>
      <label>
        Location Title<br />
        <input type="text" id="locationTitle" />
      </label>
    </p>
    <p>
      <label>
        Category<br />
        <input type="text" id="locationCategory" /><br />
        <small style="font-style: italic;">Examples: Farmers Market, Community Garden, Food Pantry, Supermarket</small>
        <!--
        <select id="locationCategory">
          <option value="other">Other</option>
          <option value="farmers-market">Farmer’s Market</option>
          <option value="community-garden">Community Garden</option>
          <option value="food-pantry">Food Pantry</option>
          <option value="supermarket">Supermarket</option>
        </select>
        -->
      </label>
    </p>
    <p>
      <label>
        Street Address<br />
        <input type="text" id="locationAddress1" />
      </label>
    </p>
    <p>
      <label>
        Street Address 2<br />
        <input type="text" id="locationAddress2" />
      </label>
    </p>
    <p>
      <label>
        City<br />
        <input type="text" id="locationCity" />
      </label>
    </p>
    <p>
      State<br />
      <input type="text" value="California" disabled />
    </p>
    <p>
      <label>
        ZIP Code<br />
        <input type="text" id="locationZip" />
      </label>
    </p>
    <p>
      <label>
        Website<br />
        <input type="text" id="locationWebsite" />
      </label>
    </p>
    <p>
      <label>
        Phone<br />
        <input type="text" id="locationPhone" />
      </label>
    </p>
    <p>
      <label>
        Is there anything else you’d like to tell us about this location?<br />
        <textarea id="userText"></textarea>
      </label>
    </p>
    <p class="action">
      <button type="submit" id="submit">Add Location</button>
    </p>
  </form>
</section>

<section class="success hidden" role="status" id="messageSection">      
</section>

<script src="/assets/js/github-backend.js"></script>

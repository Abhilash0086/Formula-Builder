// const formulaBox = document.getElementById('formulaBox');

// function createToken(type, value) {
//   const span = document.createElement('span');
//   span.classList.add('token', type);
//   span.textContent = value;

//   const remove = document.createElement('span');
//   remove.classList.add('remove');
//   remove.textContent = ' ×';
//   remove.addEventListener('click', () => {
//     span.remove();
//   });

//   span.appendChild(remove);
//   formulaBox.appendChild(span);
// }

// // Aggregates & operators
// document.querySelectorAll('#aggregates button').forEach(btn => {
//   btn.addEventListener('click', () => createToken('aggregate', btn.textContent));
// });
// document.querySelectorAll('#operators button').forEach(btn => {
//   btn.addEventListener('click', () => createToken('operator', btn.textContent));
// });

// // Field selection
// document.getElementById('fieldSelect').addEventListener('change', (e) => {
//   if (e.target.value) createToken('field', e.target.value);
//   e.target.selectedIndex = 0; 
// });

// // Constant input
// document.getElementById('addConstant').addEventListener('click', () => {
//   const constant = document.getElementById('constant').value.trim();
//   if (!isNaN(constant) && constant !== '') {
//     createToken('constant', constant);
//     document.getElementById('constant').value = '';
//   } else {
//     alert('Enter a valid numeric constant');
//   }
// });

// // Verify formula syntax
// document.getElementById('verifyBtn').addEventListener('click', () => {
//   const tokens = Array.from(formulaBox.querySelectorAll('.token')).map(t => 
//     t.textContent.replace('×', '').trim()
//   );
//   const formula = tokens.join(' ').trim();

//   if (!formula) {
//     alert('Formula is empty. Add some fields/operators/constants first.');
//     return;
//   }

//   try {
//     new Function(`return (${formula.replace(/[^-+*/0-9().]/g, '')})`);
//     alert('Formula syntax looks valid!');
//   } catch {
//     alert('Invalid formula syntax');
//   }
// });

// // Cancel 
// document.getElementById('cancelBtn').addEventListener('click', () => {
//   formulaBox.innerHTML = '';
//   document.getElementById('formulaName').value = '';
//   document.getElementById('constant').value = '';
// });

// // Save 
// document.getElementById('saveBtn').onclick = () => {
//   const name = document.getElementById('formulaName').value.trim();

//   const tokens = Array.from(formulaBox.querySelectorAll('.token')).map(t =>
//     t.textContent.replace('×', '').trim()
//   );
//   const formula = tokens.join(' ').trim();

//   if (!name || !formula) {
//     alert('Please fill in the formula name and formula before saving.');
//     return;
//   }

//   localStorage.setItem(name, formula);
//   alert('Formula saved successfully!');

//   console.log(`Formula: ${formula}`);
// };





const formulaBox = document.getElementById('formulaBox');

let cursor = document.createElement('span');
cursor.classList.add('cursor');
formulaBox.appendChild(cursor);

// --- Create token ---
function createToken(type, value) {
  const span = document.createElement('span');
  span.classList.add('token', type);
  span.textContent = value;

  const remove = document.createElement('span');
  remove.classList.add('remove');
  remove.textContent = ' ×';
  remove.addEventListener('click', () => span.remove());
  span.appendChild(remove);

  // Insert the new token before the cursor
  formulaBox.insertBefore(span, cursor);
}


// --- Improved click handler (click anywhere between tokens) ---
formulaBox.addEventListener('click', (e) => {
  const tokens = Array.from(formulaBox.querySelectorAll('.token'));
  const clickX = e.clientX;

  // If there are no tokens, just append cursor at start
  if (tokens.length === 0) {
    formulaBox.appendChild(cursor);
    return;
  }

  // Find the closest token boundary based on click position
  let inserted = false;
  for (let i = 0; i < tokens.length; i++) {
    const rect = tokens[i].getBoundingClientRect();

    if (clickX < rect.left + rect.width / 2) {
      tokens[i].insertAdjacentElement('beforebegin', cursor);
      inserted = true;
      break;
    }
  }

  // If not inserted, place at the end
  if (!inserted) {
    formulaBox.appendChild(cursor);
  }
});


// --- Handle backspace ---
document.addEventListener('keydown', (e) => {
  if (e.key === 'Backspace' && document.activeElement === document.body) {
    const prev = cursor.previousSibling;
    if (prev && prev.classList && prev.classList.contains('token')) {
      e.preventDefault();
      prev.remove();
    }
  }
});

// --- Aggregates & operators ---
document.querySelectorAll('#aggregates button').forEach(btn => {
  btn.addEventListener('click', () => createToken('aggregate', btn.textContent));
});
document.querySelectorAll('#operators button').forEach(btn => {
  btn.addEventListener('click', () => createToken('operator', btn.textContent));
});

// --- Field selection ---
document.getElementById('fieldSelect').addEventListener('change', (e) => {
  if (e.target.value) createToken('field', e.target.value);
  e.target.selectedIndex = 0;
});

// --- Constant input ---
document.getElementById('addConstant').addEventListener('click', () => {
  const constant = document.getElementById('constant').value.trim();
  if (!isNaN(constant) && constant !== '') {
    createToken('constant', constant);
    document.getElementById('constant').value = '';
  } else {
    showToast('Enter a valid numeric constant', 'warning')
  }
});

// // --- Verify formula syntax ---
// document.getElementById('verifyBtn').addEventListener('click', () => {
//   const tokens = Array.from(formulaBox.querySelectorAll('.token')).map(t =>
//     t.textContent.replace('×', '').trim()
//   );
//   const formula = tokens.join(' ').trim();

//   if (!formula) {
//     showToast('Formula is empty.', 'warning')
//     return;
//   }

//   try {
//     new Function(`return (${formula.replace(/[^-+*/0-9().]/g, '')})`);
//     showToast('Formula syntax looks valid!', 'success')
//   } catch {
//     showToast('Invalid formula syntax', 'error')
//   }
// });

// --- Verify formula syntax (with detailed error feedback + toasts) ---
document.getElementById('verifyBtn').addEventListener('click', () => {
  const tokens = Array.from(formulaBox.querySelectorAll('.token')).map(t =>
    t.textContent.replace('×', '').trim()
  );
  const formula = tokens.join(' ').trim();

  if (!formula) {
    showToast('Formula is empty.', 'warning');
    return;
  }

  const stripped = formula.replace(/[^-+*/0-9().]/g, '');

  // --- Step 1: Check parentheses balance ---
  let depth = 0;
  for (let i = 0; i < stripped.length; i++) {
    if (stripped[i] === '(') depth++;
    if (stripped[i] === ')') depth--;
    if (depth < 0) {
      showToast(`Syntax Error: Extra ')' at position ${i + 1}`, 'error');
      return;
    }
  }
  if (depth > 0) {
    showToast(`Syntax Error: Missing ')' — unbalanced parentheses.`, 'error');
    return;
  }

  // --- Step 2: Detect consecutive operators ---
  if (/(\+|\-|\*|\/){2,}/.test(stripped)) {
    const badSeq = stripped.match(/(\+|\-|\*|\/){2,}/)[0];
    showToast(`Syntax Error: Invalid operator sequence '${badSeq}'`, 'error');
    return;
  }

  // --- Step 3: Try JS evaluation for deeper syntax errors ---
  try {
    new Function(`return (${stripped})`);
    showToast('Formula syntax valid!', 'success');
  } catch (err) {
    const msg = err.message.includes('Unexpected token')
      ? 'Unexpected token or misplaced operator.'
      : err.message.includes('Unexpected end of input')
      ? 'Formula seems incomplete.'
      : err.message;
    showToast(`Syntax Error: ${msg}`, 'error');
  }
});



// --- Cancel ---
document.getElementById('cancelBtn').addEventListener('click', () => {
  formulaBox.innerHTML = '';
  formulaBox.appendChild(cursor);
  document.getElementById('formulaName').value = '';
  document.getElementById('constant').value = '';
});

// Save
document.getElementById('saveBtn').onclick = () => {
  // Hardcoded metadata (based on your example)
  const name = "Formula Builder";
  const description = "Create and Save Formula";
  const createdBy = "Admin"; 

  const tokens = Array.from(formulaBox.querySelectorAll('.token')).map(t =>
    t.textContent.replace('×', '').trim()
  );
  const formula = tokens.join(' ').trim();

  if (!name || !formula) {
    showToast('Please fill in the formula name and formula before saving.', 'warning')
    return;
  }

  // --- Step 1: Syntax validation ---
  try {
    // Basic syntax check: parentheses, numbers, operators
    new Function(`return (${formula.replace(/[^-+*/0-9().]/g, '')})`);
  } catch {
    showToast('Invalid formula syntax. Please fix errors before saving.', 'error')
    return; // ❌ Stop here — don't save
  }

  // --- Parse expression into tree ---
  const expressionTree = parseExpression(formula);

  // --- Build JSON ---
  const finalJson = {
    name,
    description,
    createdBy,
    expression: {
      rawExpression: formula,
      expressionTree
    }
  };

  // --- Save formatted version ---
  const formattedJson = JSON.stringify(finalJson, null, 2);
  localStorage.setItem(name, formattedJson);

  showToast('Formula JSON generated successfully!', 'success')
  console.log(formattedJson);

};


// --- Expression Parser ---
function parseExpression(expression) {
  expression = expression.replace(/\s+/g, '');

  // Constant (number)
  if (!isNaN(expression)) {
    return { type: "constant", value: Number(expression) };
  }

  // Constant like pi
  if (expression.toLowerCase() === 'pi') {
    return { type: "constant", value: 3.14 };
  }

  // Field (e.g. active)
  if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(expression)) {
    return { type: "field", name: expression };
  }

  // Function call: SUM(...), AVG(...), etc.
  const funcMatch = expression.match(/^([A-Z]+)\((.*)\)$/);
  if (funcMatch) {
    return {
      type: "function",
      name: funcMatch[1],
      args: [parseExpression(funcMatch[2])]
    };
  }

  // Remove outer parentheses if they enclose entire expression
  if (expression.startsWith('(') && expression.endsWith(')')) {
    return parseExpression(expression.slice(1, -1));
  }

  // Operator (+, -, *, /)
  const operatorMatch = findMainOperator(expression);
  if (operatorMatch) {
    const { operator, left, right } = operatorMatch;
    return {
      type: "operator",
      value: operator,
      operands: [parseExpression(left), parseExpression(right)]
    };
  }

  return { type: "unknown", value: expression };
}

// --- Find main operator (respecting parentheses) ---
function findMainOperator(expr) {
  let depth = 0;
  const operators = ['+', '-', '*', '/'];
  for (let i = expr.length - 1; i >= 0; i--) {
    const ch = expr[i];
    if (ch === ')') depth++;
    else if (ch === '(') depth--;
    else if (depth === 0 && operators.includes(ch)) {
      return {
        operator: ch,
        left: expr.slice(0, i),
        right: expr.slice(i + 1)
      };
    }
  }
  return null;
}

// --- Toast Notification ---
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  document.body.appendChild(toast);

  // Trigger fade-in animation
  setTimeout(() => toast.classList.add('show'), 100);

  // Remove after 5 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}



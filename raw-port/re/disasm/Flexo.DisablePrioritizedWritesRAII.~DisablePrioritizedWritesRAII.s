__ZN28DisablePrioritizedWritesRAIID1Ev:
0000000000478120	pushq	%rbp
0000000000478121	movq	%rsp, %rbp
0000000000478124	pushq	%rbx
0000000000478125	pushq	%rax
0000000000478126	movq	%rdi, %rbx
0000000000478129	movq	(%rdi), %rdi
000000000047812c	movq	0x1753aed(%rip), %rsi
0000000000478133	callq	*0x1475587(%rip)                ## Objc message: -[%rdi makeValidCaptionRoleFormat:]
0000000000478139	movq	(%rbx), %rdi
000000000047813c	callq	*0x14755c6(%rip)                ## literal pool symbol address: _objc_release
0000000000478142	addq	$0x8, %rsp
0000000000478146	popq	%rbx
0000000000478147	popq	%rbp
0000000000478148	retq
0000000000478149	movq	%rax, %rdi
000000000047814c	callq	___clang_call_terminate
0000000000478151	nopw	%cs:(%rax,%rax)

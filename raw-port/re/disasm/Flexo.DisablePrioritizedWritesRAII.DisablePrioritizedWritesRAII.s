__ZN28DisablePrioritizedWritesRAIIC1EP12FFSharedLock:
00000000004780b0	pushq	%rbp
00000000004780b1	movq	%rsp, %rbp
00000000004780b4	pushq	%rbx
00000000004780b5	pushq	%rax
00000000004780b6	movq	%rdi, %rbx
00000000004780b9	movq	%rsi, %rdi
00000000004780bc	callq	*0x147564e(%rip)                ## literal pool symbol address: _objc_retain
00000000004780c2	movq	%rax, (%rbx)
00000000004780c5	movq	0x1753b4c(%rip), %rsi
00000000004780cc	movq	%rax, %rdi
00000000004780cf	addq	$0x8, %rsp
00000000004780d3	popq	%rbx
00000000004780d4	popq	%rbp
00000000004780d5	jmpq	*0x14755e5(%rip)                ## Objc message: -[%rdi makeValidCaptionRoleFormat:]
00000000004780db	nopl	(%rax,%rax)

__ZN15OZQuadraticPathD1Ev:
00000000004ef780	pushq	%rbp
00000000004ef781	movq	%rsp, %rbp
00000000004ef784	pushq	%r14
00000000004ef786	pushq	%rbx
00000000004ef787	movq	%rdi, %rbx
00000000004ef78a	movq	0x8(%rdi), %r14
00000000004ef78e	cmpq	%rdi, %r14
00000000004ef791	jne	0x4ef7e9
00000000004ef793	cmpq	$0x0, 0x10(%rbx)
00000000004ef798	je	0x4ef7d1
00000000004ef79a	movq	(%rbx), %rax
00000000004ef79d	movq	0x8(%rbx), %rdi
00000000004ef7a1	movq	0x8(%rax), %rax
00000000004ef7a5	movq	(%rdi), %rcx
00000000004ef7a8	movq	%rax, 0x8(%rcx)
00000000004ef7ac	movq	%rcx, (%rax)
00000000004ef7af	movq	$0x0, 0x10(%rbx)
00000000004ef7b7	cmpq	%rbx, %rdi
00000000004ef7ba	je	0x4ef7d1
00000000004ef7bc	nopl	(%rax)
00000000004ef7c0	movq	0x8(%rdi), %r14
00000000004ef7c4	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000004ef7c9	movq	%r14, %rdi
00000000004ef7cc	cmpq	%rbx, %r14
00000000004ef7cf	jne	0x4ef7c0
00000000004ef7d1	popq	%rbx
00000000004ef7d2	popq	%r14
00000000004ef7d4	popq	%rbp
00000000004ef7d5	retq
00000000004ef7d6	nopw	%cs:(%rax,%rax)
00000000004ef7e0	movq	0x8(%r14), %r14
00000000004ef7e4	cmpq	%rbx, %r14
00000000004ef7e7	je	0x4ef793
00000000004ef7e9	movq	0x10(%r14), %rdi
00000000004ef7ed	testq	%rdi, %rdi
00000000004ef7f0	je	0x4ef7e0
00000000004ef7f2	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000004ef7f7	jmp	0x4ef7e0
00000000004ef7f9	nopl	(%rax)

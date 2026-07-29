__ZN8OZSpline18getValidVertexIterEPv:
000000000002fdac	pushq	%rbp
000000000002fdad	movq	%rsp, %rbp
000000000002fdb0	movq	0x48(%rdi), %rcx
000000000002fdb4	movq	0x58(%rdi), %rdx
000000000002fdb8	movq	0x80(%rdi), %rax
000000000002fdbf	movq	0x60(%rdi), %r8
000000000002fdc3	subq	%rdx, %r8
000000000002fdc6	sarq	$0x3, %r8
000000000002fdca	cmpq	%r8, %rax
000000000002fdcd	jae	0x2fdd5
000000000002fdcf	cmpq	%rsi, (%rdx,%rax,8)
000000000002fdd3	je	0x2fe4c
000000000002fdd5	testq	%rax, %rax
000000000002fdd8	jle	0x2fdea
000000000002fdda	leaq	-0x1(%rax), %r9
000000000002fdde	cmpq	%r8, %r9
000000000002fde1	jae	0x2fdea
000000000002fde3	cmpq	%rsi, -0x8(%rdx,%rax,8)
000000000002fde8	je	0x2fe3f
000000000002fdea	leaq	0x1(%rax), %r9
000000000002fdee	cmpq	%r8, %r9
000000000002fdf1	jae	0x2fdfa
000000000002fdf3	cmpq	%rsi, 0x8(%rdx,%rax,8)
000000000002fdf8	je	0x2fe3f
000000000002fdfa	movq	0x50(%rdi), %rdx
000000000002fdfe	movq	%rdx, %r8
000000000002fe01	movq	%rcx, %rax
000000000002fe04	subq	%rcx, %r8
000000000002fe07	je	0x2fe24
000000000002fe09	cmpq	%rsi, (%rax)
000000000002fe0c	je	0x2fe24
000000000002fe0e	addq	$0x8, %rax
000000000002fe12	cmpq	%rdx, %rax
000000000002fe15	jne	0x2fe09
000000000002fe17	sarq	$0x3, %r8
000000000002fe1b	movq	%r8, 0x80(%rdi)
000000000002fe22	jmp	0x2fe3a
000000000002fe24	movq	%rax, %rsi
000000000002fe27	subq	%rcx, %rsi
000000000002fe2a	sarq	$0x3, %rsi
000000000002fe2e	movq	%rsi, 0x80(%rdi)
000000000002fe35	cmpq	%rdx, %rax
000000000002fe38	jne	0x2fe50
000000000002fe3a	movq	%rcx, %rax
000000000002fe3d	jmp	0x2fe50
000000000002fe3f	leaq	(%rcx,%r9,8), %rax
000000000002fe43	movq	%r9, 0x80(%rdi)
000000000002fe4a	jmp	0x2fe50
000000000002fe4c	leaq	(%rcx,%rax,8), %rax
000000000002fe50	popq	%rbp
000000000002fe51	retq

__ZNSt3__14listIP25OZDefaultOverlayComponentNS_9allocatorIS2_EEED1Ev:
0000000000046a00	cmpq	$0x0, 0x10(%rdi)
0000000000046a05	je	0x46a55
0000000000046a07	pushq	%rbp
0000000000046a08	movq	%rsp, %rbp
0000000000046a0b	pushq	%r14
0000000000046a0d	pushq	%rbx
0000000000046a0e	movq	%rdi, %rbx
0000000000046a11	movq	(%rdi), %rax
0000000000046a14	movq	0x8(%rdi), %rdi
0000000000046a18	movq	0x8(%rax), %rax
0000000000046a1c	movq	(%rdi), %rcx
0000000000046a1f	movq	%rax, 0x8(%rcx)
0000000000046a23	movq	%rcx, (%rax)
0000000000046a26	movq	$0x0, 0x10(%rbx)
0000000000046a2e	cmpq	%rbx, %rdi
0000000000046a31	je	0x46a51
0000000000046a33	nopw	%cs:(%rax,%rax)
0000000000046a40	movq	0x8(%rdi), %r14
0000000000046a44	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000046a49	movq	%r14, %rdi
0000000000046a4c	cmpq	%rbx, %r14
0000000000046a4f	jne	0x46a40
0000000000046a51	popq	%rbx
0000000000046a52	popq	%r14
0000000000046a54	popq	%rbp
0000000000046a55	retq
0000000000046a56	nopw	%cs:(%rax,%rax)
__ZN10OZDocumentC1Eb:
0000000000046a60	pushq	%rbp
0000000000046a61	movq	%rsp, %rbp
0000000000046a64	popq	%rbp
0000000000046a65	jmp	__ZN10OZDocumentC2Eb            ## OZDocument::OZDocument(bool)
0000000000046a6a	nopw	(%rax,%rax)
__ZN10OZDocumentC2ERKS_b:

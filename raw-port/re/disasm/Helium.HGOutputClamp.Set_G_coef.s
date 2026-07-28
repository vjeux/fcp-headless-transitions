__ZN13HGOutputClamp10Set_G_coefEffff:
00000000001aca10	cmpl	$0x0, 0x198(%rdi)
00000000001aca17	je	0x1aca36
00000000001aca19	pushq	%rbp
00000000001aca1a	movq	%rsp, %rbp
00000000001aca1d	movq	0x1a0(%rdi), %rdi
00000000001aca24	movq	(%rdi), %rax
00000000001aca27	movl	$0x4, %esi
00000000001aca2c	callq	*0x60(%rax)
00000000001aca2f	movl	$0x1, %eax
00000000001aca34	popq	%rbp
00000000001aca35	retq
00000000001aca36	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
00000000001aca3b	retq
00000000001aca3c	nopl	(%rax)

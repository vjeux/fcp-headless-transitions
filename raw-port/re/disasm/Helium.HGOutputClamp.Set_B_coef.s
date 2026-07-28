__ZN13HGOutputClamp10Set_B_coefEffff:
00000000001aca40	cmpl	$0x0, 0x198(%rdi)
00000000001aca47	je	0x1aca66
00000000001aca49	pushq	%rbp
00000000001aca4a	movq	%rsp, %rbp
00000000001aca4d	movq	0x1a0(%rdi), %rdi
00000000001aca54	movq	(%rdi), %rax
00000000001aca57	movl	$0x5, %esi
00000000001aca5c	callq	*0x60(%rax)
00000000001aca5f	movl	$0x1, %eax
00000000001aca64	popq	%rbp
00000000001aca65	retq
00000000001aca66	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
00000000001aca6b	retq
00000000001aca6c	nopl	(%rax)

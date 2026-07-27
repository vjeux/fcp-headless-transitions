_HGRectIsInfinite:
0000000000107ae0	pushq	%rbp
0000000000107ae1	movq	%rsp, %rbp
0000000000107ae4	movl	%edi, %eax
0000000000107ae6	negl	%eax
0000000000107ae8	seto	%al
0000000000107aeb	movabsq	$-0x7fffffff00000000, %rcx      ## imm = 0x8000000100000000
0000000000107af5	cmpq	%rcx, %rdi
0000000000107af8	setl	%cl
0000000000107afb	orb	%al, %cl
0000000000107afd	cmpl	$0x7fffffff, %esi               ## imm = 0x7FFFFFFF
0000000000107b03	sete	%al
0000000000107b06	shrq	$0x20, %rsi
0000000000107b0a	cmpl	$0x7fffffff, %esi               ## imm = 0x7FFFFFFF
0000000000107b10	sete	%dl
0000000000107b13	orb	%al, %dl
0000000000107b15	orb	%cl, %dl
0000000000107b17	movzbl	%dl, %eax
0000000000107b1a	popq	%rbp
0000000000107b1b	retq
0000000000107b1c	nopl	(%rax)

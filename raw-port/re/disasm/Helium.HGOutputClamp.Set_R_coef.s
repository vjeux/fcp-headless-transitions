__ZN13HGOutputClamp10Set_R_coefEffff:
00000000001ac9e0	cmpl	$0x0, 0x198(%rdi)
00000000001ac9e7	je	0x1aca06
00000000001ac9e9	pushq	%rbp
00000000001ac9ea	movq	%rsp, %rbp
00000000001ac9ed	movq	0x1a0(%rdi), %rdi
00000000001ac9f4	movq	(%rdi), %rax
00000000001ac9f7	movl	$0x3, %esi
00000000001ac9fc	callq	*0x60(%rax)
00000000001ac9ff	movl	$0x1, %eax
00000000001aca04	popq	%rbp
00000000001aca05	retq
00000000001aca06	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
00000000001aca0b	retq
00000000001aca0c	nopl	(%rax)

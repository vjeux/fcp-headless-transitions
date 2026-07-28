__ZN13HGOutputClamp11Set_Cr_coefEffff:
00000000001ac9b0	cmpl	$0x0, 0x198(%rdi)
00000000001ac9b7	je	0x1ac9d6
00000000001ac9b9	pushq	%rbp
00000000001ac9ba	movq	%rsp, %rbp
00000000001ac9bd	movq	0x1a0(%rdi), %rdi
00000000001ac9c4	movq	(%rdi), %rax
00000000001ac9c7	movl	$0x2, %esi
00000000001ac9cc	callq	*0x60(%rax)
00000000001ac9cf	movl	$0x1, %eax
00000000001ac9d4	popq	%rbp
00000000001ac9d5	retq
00000000001ac9d6	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
00000000001ac9db	retq
00000000001ac9dc	nopl	(%rax)

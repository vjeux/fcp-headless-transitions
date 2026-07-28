__ZN13HGOutputClamp11Set_Yp_coefEffff:
00000000001ac940	cmpl	$0x0, 0x198(%rdi)
00000000001ac947	je	0x1ac963
00000000001ac949	pushq	%rbp
00000000001ac94a	movq	%rsp, %rbp
00000000001ac94d	movq	0x1a0(%rdi), %rdi
00000000001ac954	movq	(%rdi), %rax
00000000001ac957	xorl	%esi, %esi
00000000001ac959	callq	*0x60(%rax)
00000000001ac95c	movl	$0x1, %eax
00000000001ac961	popq	%rbp
00000000001ac962	retq
00000000001ac963	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
00000000001ac968	retq
00000000001ac969	nopl	(%rax)

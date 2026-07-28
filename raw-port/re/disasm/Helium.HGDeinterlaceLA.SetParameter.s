__ZN15HGDeinterlaceLA12SetParameterEiffff:
000000000003e880	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
000000000003e885	testl	%esi, %esi
000000000003e887	je	0x3e88a
000000000003e889	retq
000000000003e88a	pushq	%rbp
000000000003e88b	movq	%rsp, %rbp
000000000003e88e	insertps	$0x10, %xmm1, %xmm0             ## xmm0 = xmm0[0],xmm1[0],xmm0[2,3]
000000000003e894	cvttps2dq	%xmm0, %xmm0
000000000003e898	movlps	%xmm0, 0x198(%rdi)
000000000003e89f	cvttss2si	%xmm2, %eax
000000000003e8a3	movl	%eax, 0x1a0(%rdi)
000000000003e8a9	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
000000000003e8ae	movl	$0x1, %eax
000000000003e8b3	popq	%rbp
000000000003e8b4	retq
000000000003e8b5	nopw	%cs:(%rax,%rax)

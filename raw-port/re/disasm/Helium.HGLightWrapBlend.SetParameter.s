__ZN16HGLightWrapBlend12SetParameterEiffff:
00000000001afef0	pushq	%rbp
00000000001afef1	movq	%rsp, %rbp
00000000001afef4	cmpl	$0x1, %esi
00000000001afef7	je	0x1aff14
00000000001afef9	testl	%esi, %esi
00000000001afefb	jne	0x1aff1c
00000000001afefd	roundss	$0x9, %xmm0, %xmm4
00000000001aff03	cvttss2si	%xmm4, %rax
00000000001aff08	movl	%eax, 0x1b0(%rdi)
00000000001aff0e	popq	%rbp
00000000001aff0f	jmp	__ZN6HGNode12SetParameterEiffff ## HGNode::SetParameter(int, float, float, float, float)
00000000001aff14	movss	%xmm0, 0x198(%rdi)
00000000001aff1c	popq	%rbp
00000000001aff1d	jmp	__ZN6HGNode12SetParameterEiffff ## HGNode::SetParameter(int, float, float, float, float)
00000000001aff22	nopw	%cs:(%rax,%rax)

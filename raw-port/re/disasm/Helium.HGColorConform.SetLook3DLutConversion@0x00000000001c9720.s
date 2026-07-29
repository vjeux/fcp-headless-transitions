__ZN14HGColorConform22SetLook3DLutConversionEN12HGColorGamma30hgColorGammaMatrixCoefficientsENS0_26hgColorGammaColorPrimariesENS0_28hgColorGammaTransferFunctionES2_PK8__CFDatammmfffbNS_15hgLookLUTEndianEPhmffff:
00000000001c9720	pushq	%rbp
00000000001c9721	movq	%rsp, %rbp
00000000001c9724	pushq	%r15
00000000001c9726	pushq	%r14
00000000001c9728	pushq	%r13
00000000001c972a	pushq	%r12
00000000001c972c	pushq	%rbx
00000000001c972d	subq	$0x58, %rsp
00000000001c9731	movss	%xmm6, -0x4c(%rbp)
00000000001c9736	movss	%xmm5, -0x48(%rbp)
00000000001c973b	movss	%xmm4, -0x44(%rbp)
00000000001c9740	movss	%xmm3, -0x40(%rbp)
00000000001c9745	movss	%xmm2, -0x3c(%rbp)
00000000001c974a	movss	%xmm1, -0x38(%rbp)
00000000001c974f	movss	%xmm0, -0x34(%rbp)
00000000001c9754	movq	%r9, %r12
00000000001c9757	movl	%r8d, -0x30(%rbp)
00000000001c975b	movl	%ecx, %r13d
00000000001c975e	movl	%edx, %ebx
00000000001c9760	movl	%esi, -0x2c(%rbp)
00000000001c9763	movq	%rdi, %r14
00000000001c9766	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000001c976b	movl	$0x5, 0x1e4(%r14)
00000000001c9776	movq	%r14, %rdi
00000000001c9779	callq	__ZN14HGColorConform21ClearConversionParamsEv ## HGColorConform::ClearConversionParams()
00000000001c977e	movq	0x218(%r14), %rdi
00000000001c9785	testq	%rdi, %rdi
00000000001c9788	je	0x1c9790
00000000001c978a	movq	(%rdi), %rax
00000000001c978d	callq	*0x18(%rax)
00000000001c9790	movl	$0x78, %edi
00000000001c9795	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001c979a	movq	%rax, %r15
00000000001c979d	movq	0x40(%rbp), %rax
00000000001c97a1	movq	%rax, 0x20(%rsp)
00000000001c97a6	movq	0x38(%rbp), %rax
00000000001c97aa	movq	%rax, 0x18(%rsp)
00000000001c97af	movl	0x30(%rbp), %eax
00000000001c97b2	movl	%eax, 0x10(%rsp)
00000000001c97b6	movzbl	0x28(%rbp), %eax
00000000001c97ba	movl	%eax, 0x8(%rsp)
00000000001c97be	movq	0x20(%rbp), %rax
00000000001c97c2	movq	%rax, (%rsp)
00000000001c97c6	movq	%r15, %rdi
00000000001c97c9	movl	%ebx, %esi
00000000001c97cb	movl	%r13d, %edx
00000000001c97ce	movq	%r12, %rcx
00000000001c97d1	movq	0x10(%rbp), %r8
00000000001c97d5	movq	0x18(%rbp), %r9
00000000001c97d9	movss	-0x34(%rbp), %xmm0
00000000001c97de	movss	-0x38(%rbp), %xmm1
00000000001c97e3	movss	-0x3c(%rbp), %xmm2
00000000001c97e8	movss	-0x40(%rbp), %xmm3
00000000001c97ed	movss	-0x44(%rbp), %xmm4
00000000001c97f2	movss	-0x48(%rbp), %xmm5
00000000001c97f7	movss	-0x4c(%rbp), %xmm6
00000000001c97fc	callq	__ZN23HGColorConformLook3DLUTC2EN12HGColorGamma26hgColorGammaColorPrimariesENS0_28hgColorGammaTransferFunctionEPK8__CFDatammmfffbN14HGColorConform15hgLookLUTEndianEPhmffff ## HGColorConformLook3DLUT::HGColorConformLook3DLUT(HGColorGamma::hgColorGammaColorPrimaries, HGColorGamma::hgColorGammaTransferFunction, __CFData const*, unsigned long, unsigned long, unsigned long, float, float, float, bool, HGColorConform::hgLookLUTEndian, unsigned char*, unsigned long, float, float, float, float)
00000000001c9801	movq	%r15, 0x218(%r14)
00000000001c9808	movl	-0x2c(%rbp), %eax
00000000001c980b	movl	%eax, 0x220(%r14)
00000000001c9812	movl	-0x30(%rbp), %eax
00000000001c9815	movl	%eax, 0x224(%r14)
00000000001c981c	movb	$0x1, %al
00000000001c981e	addq	$0x58, %rsp
00000000001c9822	popq	%rbx
00000000001c9823	popq	%r12
00000000001c9825	popq	%r13
00000000001c9827	popq	%r14
00000000001c9829	popq	%r15
00000000001c982b	popq	%rbp
00000000001c982c	retq
00000000001c982d	movq	%rax, %rbx
00000000001c9830	movq	%r15, %rdi
00000000001c9833	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001c9838	movq	%rbx, %rdi
00000000001c983b	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume

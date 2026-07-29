__ZNK13HGLegacyBlend5CloneEv:
0000000000241a50	pushq	%rbp
0000000000241a51	movq	%rsp, %rbp
0000000000241a54	pushq	%r14
0000000000241a56	pushq	%rbx
0000000000241a57	movq	%rdi, %r14
0000000000241a5a	movl	$0x1c0, %edi                    ## imm = 0x1C0
0000000000241a5f	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000241a64	movq	%rax, %rbx
0000000000241a67	movq	%rax, %rdi
0000000000241a6a	callq	__ZN13HGLegacyBlendC2Ev         ## HGLegacyBlend::HGLegacyBlend()
0000000000241a6f	cvtsi2ssl	0x1a8(%r14), %xmm0
0000000000241a78	movq	(%rbx), %rax
0000000000241a7b	xorps	%xmm1, %xmm1
0000000000241a7e	xorps	%xmm2, %xmm2
0000000000241a81	xorps	%xmm3, %xmm3
0000000000241a84	movq	%rbx, %rdi
0000000000241a87	xorl	%esi, %esi
0000000000241a89	callq	*0x60(%rax)
0000000000241a8c	movss	0x1a0(%r14), %xmm0
0000000000241a95	movq	(%rbx), %rax
0000000000241a98	xorps	%xmm1, %xmm1
0000000000241a9b	xorps	%xmm2, %xmm2
0000000000241a9e	xorps	%xmm3, %xmm3
0000000000241aa1	movq	%rbx, %rdi
0000000000241aa4	movl	$0x1, %esi
0000000000241aa9	callq	*0x60(%rax)
0000000000241aac	xorps	%xmm0, %xmm0
0000000000241aaf	cvtsi2ssl	0x1ac(%r14), %xmm0
0000000000241ab8	movq	(%rbx), %rax
0000000000241abb	xorps	%xmm1, %xmm1
0000000000241abe	xorps	%xmm2, %xmm2
0000000000241ac1	xorps	%xmm3, %xmm3
0000000000241ac4	movq	%rbx, %rdi
0000000000241ac7	movl	$0x2, %esi
0000000000241acc	callq	*0x60(%rax)
0000000000241acf	movq	%rbx, %rax
0000000000241ad2	popq	%rbx
0000000000241ad3	popq	%r14
0000000000241ad5	popq	%rbp
0000000000241ad6	retq
0000000000241ad7	movq	%rax, %r14
0000000000241ada	movq	%rbx, %rdi
0000000000241add	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000241ae2	movq	%r14, %rdi
0000000000241ae5	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000241aea	nopw	(%rax,%rax)

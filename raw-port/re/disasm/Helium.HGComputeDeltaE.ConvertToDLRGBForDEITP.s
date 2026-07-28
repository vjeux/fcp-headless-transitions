__ZN15HGComputeDeltaE22ConvertToDLRGBForDEITPERK5HGRefI6HGNodeE:
0000000000093c90	pushq	%rbp
0000000000093c91	movq	%rsp, %rbp
0000000000093c94	pushq	%r15
0000000000093c96	pushq	%r14
0000000000093c98	pushq	%r12
0000000000093c9a	pushq	%rbx
0000000000093c9b	movq	%rdi, %r14
0000000000093c9e	movq	$0x0, (%rdi)
0000000000093ca5	movl	0x19c(%rsi), %eax
0000000000093cab	cmpq	$0x5, %rax
0000000000093caf	ja	0x93ea1
0000000000093cb5	movq	%rdx, %r15
0000000000093cb8	leaq	0x2dd(%rip), %rcx
0000000000093cbf	movslq	(%rcx,%rax,4), %rax
0000000000093cc3	addq	%rcx, %rax
0000000000093cc6	jmpq	*%rax
0000000000093cc8	movl	0x1a0(%rsi), %r12d
0000000000093ccf	movl	$0x1b0, %edi                    ## imm = 0x1B0
0000000000093cd4	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000093cd9	movq	%rax, %rbx
0000000000093cdc	movq	%rax, %rdi
0000000000093cdf	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
0000000000093ce4	xorl	%eax, %eax
0000000000093ce6	testl	%r12d, %r12d
0000000000093ce9	sete	%al
0000000000093cec	leaq	0x339515(%rip), %rcx
0000000000093cf3	movss	(%rcx,%rax,4), %xmm0
0000000000093cf8	leaq	0x9778f9(%rip), %rax
0000000000093cff	movq	%rax, (%rbx)
0000000000093d02	movq	$0x0, 0x198(%rbx)
0000000000093d0d	movss	%xmm0, 0x1a0(%rbx)
0000000000093d15	movb	$0x1, 0x1a4(%rbx)
0000000000093d1c	movq	(%r15), %rdx
0000000000093d1f	xorl	%r15d, %r15d
0000000000093d22	movq	%rbx, %rdi
0000000000093d25	xorl	%esi, %esi
0000000000093d27	callq	__ZN6HGNode8SetInputEiPS_       ## HGNode::SetInput(int, HGNode*)
0000000000093d2c	movq	%rbx, (%r14)
0000000000093d2f	movq	(%rbx), %rax
0000000000093d32	movq	%rbx, %r15
0000000000093d35	movq	%rbx, %rdi
0000000000093d38	callq	*0x10(%rax)
0000000000093d3b	movq	(%rbx), %rax
0000000000093d3e	movq	%rbx, %rdi
0000000000093d41	callq	*0x18(%rax)
0000000000093d44	jmp	0x93eaf
0000000000093d49	movl	$0x1b0, %edi                    ## imm = 0x1B0
0000000000093d4e	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000093d53	movq	%rax, %rbx
0000000000093d56	movq	%rax, %rdi
0000000000093d59	callq	__ZN5HGHLG11InverseOETFC1Ev     ## HGHLG::InverseOETF::InverseOETF()
0000000000093d5e	movq	(%r15), %rdx
0000000000093d61	movq	(%rbx), %rax
0000000000093d64	movq	%rbx, %rdi
0000000000093d67	xorl	%esi, %esi
0000000000093d69	callq	*0x78(%rax)
0000000000093d6c	movl	$0x1c0, %edi                    ## imm = 0x1C0
0000000000093d71	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000093d76	movq	%rax, %r12
0000000000093d79	movsd	0x3364df(%rip), %xmm0
0000000000093d81	movq	%rax, %rdi
0000000000093d84	movl	$0x1, %esi
0000000000093d89	callq	__ZN5HGHLG4OOTFC1ENS0_14ColorPrimariesEd ## HGHLG::OOTF::OOTF(HGHLG::OOTF::ColorPrimaries, double)
0000000000093d8e	movq	(%r12), %rax
0000000000093d92	xorl	%r15d, %r15d
0000000000093d95	movq	%r12, %rdi
0000000000093d98	xorl	%esi, %esi
0000000000093d9a	movq	%rbx, %rdx
0000000000093d9d	callq	*0x78(%rax)
0000000000093da0	xorl	%r15d, %r15d
0000000000093da3	movsd	0x3370dd(%rip), %xmm0
0000000000093dab	movq	%r12, %rdi
0000000000093dae	callq	__ZN5HGHLG4OOTF23setPeakDisplayLuminanceEd ## HGHLG::OOTF::setPeakDisplayLuminance(double)
0000000000093db3	movq	%r12, (%r14)
0000000000093db6	movq	(%r12), %rax
0000000000093dba	movq	%r12, %r15
0000000000093dbd	movq	%r12, %rdi
0000000000093dc0	callq	*0x10(%rax)
0000000000093dc3	movq	(%r12), %rax
0000000000093dc7	movq	%r12, %rdi
0000000000093dca	callq	*0x18(%rax)
0000000000093dcd	movq	(%rbx), %rax
0000000000093dd0	movq	%rbx, %rdi
0000000000093dd3	callq	*0x18(%rax)
0000000000093dd6	jmp	0x93eaf
0000000000093ddb	movl	0x1a0(%rsi), %r12d
0000000000093de2	movl	$0x1b0, %edi                    ## imm = 0x1B0
0000000000093de7	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000093dec	movq	%rax, %rbx
0000000000093def	movq	%rax, %rdi
0000000000093df2	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
0000000000093df7	xorl	%eax, %eax
0000000000093df9	testl	%r12d, %r12d
0000000000093dfc	sete	%al
0000000000093dff	leaq	0x339402(%rip), %rcx
0000000000093e06	movss	(%rcx,%rax,4), %xmm0
0000000000093e0b	leaq	0x9777e6(%rip), %rax
0000000000093e12	movq	%rax, (%rbx)
0000000000093e15	movq	$0x0, 0x198(%rbx)
0000000000093e20	movss	%xmm0, 0x1a0(%rbx)
0000000000093e28	movb	$0x0, 0x1a4(%rbx)
0000000000093e2f	movq	(%r15), %rdx
0000000000093e32	xorl	%r15d, %r15d
0000000000093e35	movq	%rbx, %rdi
0000000000093e38	xorl	%esi, %esi
0000000000093e3a	callq	__ZN6HGNode8SetInputEiPS_       ## HGNode::SetInput(int, HGNode*)
0000000000093e3f	movq	%rbx, (%r14)
0000000000093e42	movq	(%rbx), %rax
0000000000093e45	movq	%rbx, %r15
0000000000093e48	movq	%rbx, %rdi
0000000000093e4b	callq	*0x10(%rax)
0000000000093e4e	movq	(%rbx), %rax
0000000000093e51	movq	%rbx, %rdi
0000000000093e54	callq	*0x18(%rax)
0000000000093e57	jmp	0x93eaf
0000000000093e59	movl	$0x1b0, %edi                    ## imm = 0x1B0
0000000000093e5e	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000093e63	movq	%rax, %rbx
0000000000093e66	movsd	0x3363f2(%rip), %xmm0
0000000000093e6e	movq	%rax, %rdi
0000000000093e71	callq	__ZN4HGPQ4EOTFC1Ed              ## HGPQ::EOTF::EOTF(double)
0000000000093e76	movq	(%r15), %rdx
0000000000093e79	movq	(%rbx), %rax
0000000000093e7c	xorl	%r15d, %r15d
0000000000093e7f	movq	%rbx, %rdi
0000000000093e82	xorl	%esi, %esi
0000000000093e84	callq	*0x78(%rax)
0000000000093e87	movq	%rbx, (%r14)
0000000000093e8a	movq	(%rbx), %rax
0000000000093e8d	movq	%rbx, %r15
0000000000093e90	movq	%rbx, %rdi
0000000000093e93	callq	*0x10(%rax)
0000000000093e96	movq	(%rbx), %rax
0000000000093e99	movq	%rbx, %rdi
0000000000093e9c	callq	*0x18(%rax)
0000000000093e9f	jmp	0x93eaf
0000000000093ea1	leaq	0x847cae(%rip), %rdi            ## literal pool for: "Unexpected Colorspace/Colorspace conversion needs implementation"
0000000000093ea8	xorl	%eax, %eax
0000000000093eaa	callq	__ZN8HGLogger7warningEPKcz      ## HGLogger::warning(char const*, ...)
0000000000093eaf	movq	%r14, %rax
0000000000093eb2	popq	%rbx
0000000000093eb3	popq	%r12
0000000000093eb5	popq	%r14
0000000000093eb7	popq	%r15
0000000000093eb9	popq	%rbp
0000000000093eba	retq
0000000000093ebb	movq	%rax, %rdi
0000000000093ebe	callq	___clang_call_terminate
0000000000093ec3	movq	%rax, %rdi
0000000000093ec6	callq	___clang_call_terminate
0000000000093ecb	movq	%rax, %rdi
0000000000093ece	callq	___clang_call_terminate
0000000000093ed3	movq	%rax, %rdi
0000000000093ed6	callq	___clang_call_terminate
0000000000093edb	movq	%rax, %rdi
0000000000093ede	callq	___clang_call_terminate
0000000000093ee3	movq	%rax, %r14
0000000000093ee6	movq	%r12, %rdi
0000000000093ee9	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000093eee	jmp	0x93ef5
0000000000093ef0	jmp	0x93ef2
0000000000093ef2	movq	%rax, %r14
0000000000093ef5	xorl	%r15d, %r15d
0000000000093ef8	jmp	0x93f62
0000000000093efa	jmp	0x93f00
0000000000093efc	jmp	0x93f00
0000000000093efe	jmp	0x93f00
0000000000093f00	movq	%rax, %r14
0000000000093f03	movq	%rbx, %rdi
0000000000093f06	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000093f0b	movq	%r14, %rdi
0000000000093f0e	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000093f13	movq	%rax, %r14
0000000000093f16	movq	(%rbx), %rax
0000000000093f19	movq	%rbx, %rdi
0000000000093f1c	callq	*0x18(%rax)
0000000000093f1f	jmp	0x93f6b
0000000000093f21	movq	%rax, %rdi
0000000000093f24	callq	___clang_call_terminate
0000000000093f29	movq	%rax, %r14
0000000000093f2c	movq	(%rbx), %rax
0000000000093f2f	movq	%rbx, %rdi
0000000000093f32	callq	*0x18(%rax)
0000000000093f35	jmp	0x93f6b
0000000000093f37	movq	%rax, %rdi
0000000000093f3a	callq	___clang_call_terminate
0000000000093f3f	movq	%rax, %r14
0000000000093f42	movq	(%rbx), %rax
0000000000093f45	movq	%rbx, %rdi
0000000000093f48	callq	*0x18(%rax)
0000000000093f4b	jmp	0x93f6b
0000000000093f4d	movq	%rax, %rdi
0000000000093f50	callq	___clang_call_terminate
0000000000093f55	movq	%rax, %r14
0000000000093f58	movq	(%r12), %rax
0000000000093f5c	movq	%r12, %rdi
0000000000093f5f	callq	*0x18(%rax)
0000000000093f62	movq	(%rbx), %rax
0000000000093f65	movq	%rbx, %rdi
0000000000093f68	callq	*0x18(%rax)
0000000000093f6b	testq	%r15, %r15
0000000000093f6e	je	0x93f79
0000000000093f70	movq	(%r15), %rax
0000000000093f73	movq	%r15, %rdi
0000000000093f76	callq	*0x18(%rax)
0000000000093f79	movq	%r14, %rdi
0000000000093f7c	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000093f81	movq	%rax, %rdi
0000000000093f84	callq	___clang_call_terminate
0000000000093f89	movq	%rax, %rdi
0000000000093f8c	callq	___clang_call_terminate
0000000000093f91	movq	%rax, %rdi
0000000000093f94	callq	___clang_call_terminate
0000000000093f99	nopl	(%rax)
0000000000093f9c	subb	$-0x3, %al
0000000000093f9e	.byte 0xff #bad opcode
0000000000093f9f	incl	0x3fffffff(%rip)
0000000000093fa5	.byte 0xfe #bad opcode
0000000000093fa6	.byte 0xff #bad opcode
0000000000093fa7	incl	-0x52000001(%rip)
0000000000093fad	std
0000000000093fae	.byte 0xff #bad opcode
0000000000093faf	.byte 0xff #bad opcode
0000000000093fb0	movl	$0x66fffffe, %ebp               ## imm = 0x66FFFFFE
0000000000093fb5	nopw	%cs:(%rax,%rax)

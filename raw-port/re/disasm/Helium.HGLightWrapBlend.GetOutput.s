__ZN16HGLightWrapBlend9GetOutputEP10HGRenderer:
00000000001af9f0	pushq	%rbp
00000000001af9f1	movq	%rsp, %rbp
00000000001af9f4	pushq	%r15
00000000001af9f6	pushq	%r14
00000000001af9f8	pushq	%r13
00000000001af9fa	pushq	%r12
00000000001af9fc	pushq	%rbx
00000000001af9fd	subq	$0x18, %rsp
00000000001afa01	movq	%rsi, %r14
00000000001afa04	movq	%rdi, %rbx
00000000001afa07	movq	%rsi, %rdi
00000000001afa0a	movq	%rbx, %rsi
00000000001afa0d	xorl	%edx, %edx
00000000001afa0f	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000001afa14	movq	%rax, %r15
00000000001afa17	testq	%rax, %rax
00000000001afa1a	je	0x1afa25
00000000001afa1c	movq	(%r15), %rax
00000000001afa1f	movq	%r15, %rdi
00000000001afa22	callq	*0x10(%rax)
00000000001afa25	movq	%r15, -0x38(%rbp)
00000000001afa29	movq	%r14, %rdi
00000000001afa2c	movq	%rbx, %rsi
00000000001afa2f	movl	$0x1, %edx
00000000001afa34	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000001afa39	movq	%rax, %r14
00000000001afa3c	testq	%rax, %rax
00000000001afa3f	je	0x1afa4a
00000000001afa41	movq	(%r14), %rax
00000000001afa44	movq	%r14, %rdi
00000000001afa47	callq	*0x10(%rax)
00000000001afa4a	movq	%r14, -0x30(%rbp)
00000000001afa4e	movl	$0x280, %edi                    ## imm = 0x280
00000000001afa53	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001afa58	movq	%rax, %r14
00000000001afa5b	movq	%rax, %rdi
00000000001afa5e	callq	__ZN14HGHWMultiBlendC1Ev        ## HGHWMultiBlend::HGHWMultiBlend()
00000000001afa63	movq	(%r14), %rax
00000000001afa66	movq	%r14, %rdi
00000000001afa69	xorl	%esi, %esi
00000000001afa6b	movq	-0x38(%rbp), %rdx
00000000001afa6f	movq	%r14, -0x40(%rbp)
00000000001afa73	callq	*0x78(%rax)
00000000001afa76	movl	0x1b0(%rbx), %ecx
00000000001afa7c	movss	0x198(%rbx), %xmm0
00000000001afa84	movq	(%r14), %rax
00000000001afa87	movq	%r14, %rdi
00000000001afa8a	movl	$0x1, %esi
00000000001afa8f	movq	-0x30(%rbp), %rdx
00000000001afa93	callq	*0x260(%rax)
00000000001afa99	movl	$0x220, %edi                    ## imm = 0x220
00000000001afa9e	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001afaa3	movq	%rax, %r12
00000000001afaa6	movq	%rax, %rdi
00000000001afaa9	callq	__ZN6HGBlurC1Ev                 ## HGBlur::HGBlur()
00000000001afaae	movss	0x19c(%rbx), %xmm0
00000000001afab6	movq	(%r12), %rax
00000000001afaba	xorps	%xmm2, %xmm2
00000000001afabd	xorps	%xmm3, %xmm3
00000000001afac0	movq	%r12, %rdi
00000000001afac3	xorl	%esi, %esi
00000000001afac5	movaps	%xmm0, %xmm1
00000000001afac8	callq	*0x60(%rax)
00000000001afacb	movq	(%r12), %rax
00000000001afacf	movq	%r12, %rdi
00000000001afad2	xorl	%esi, %esi
00000000001afad4	movq	-0x38(%rbp), %rdx
00000000001afad8	callq	*0x78(%rax)
00000000001afadb	movl	$0x1b0, %edi                    ## imm = 0x1B0
00000000001afae0	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001afae5	movq	%rax, %r13
00000000001afae8	movq	%rax, %rdi
00000000001afaeb	callq	__ZN7HGGammaC1Ev                ## HGGamma::HGGamma()
00000000001afaf0	movq	%r13, %rdi
00000000001afaf3	xorl	%esi, %esi
00000000001afaf5	callq	__ZN7HGGamma19SetPremultiplyStateEb ## HGGamma::SetPremultiplyState(bool)
00000000001afafa	movss	0x1a0(%rbx), %xmm0
00000000001afb02	cvtss2sd	%xmm0, %xmm0
00000000001afb06	movsd	0x6ad7d2(%rip), %xmm1
00000000001afb0e	maxsd	%xmm0, %xmm1
00000000001afb12	movsd	0x21a746(%rip), %xmm0
00000000001afb1a	divsd	%xmm1, %xmm0
00000000001afb1e	cvtsd2ss	%xmm0, %xmm0
00000000001afb22	movq	(%r13), %rax
00000000001afb26	movss	0x218192(%rip), %xmm3
00000000001afb2e	movq	%r13, %rdi
00000000001afb31	xorl	%esi, %esi
00000000001afb33	movaps	%xmm0, %xmm1
00000000001afb36	movaps	%xmm0, %xmm2
00000000001afb39	callq	*0x60(%rax)
00000000001afb3c	movss	0x1a4(%rbx), %xmm0
00000000001afb44	ucomiss	0x218175(%rip), %xmm0
00000000001afb4b	jne	0x1afb53
00000000001afb4d	jnp	0x1afc05
00000000001afb53	movl	$0x1f0, %edi                    ## imm = 0x1F0
00000000001afb58	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001afb5d	movq	%rax, %r14
00000000001afb60	movq	%rax, %rdi
00000000001afb63	callq	__ZN13HGColorMatrixC1Ev         ## HGColorMatrix::HGColorMatrix()
00000000001afb68	movss	0x218150(%rip), %xmm0
00000000001afb70	divss	0x1a4(%rbx), %xmm0
00000000001afb78	movq	%r14, %rdi
00000000001afb7b	movaps	%xmm0, %xmm1
00000000001afb7e	movaps	%xmm0, %xmm2
00000000001afb81	callq	__ZN13HGColorMatrix5ScaleEfff   ## HGColorMatrix::Scale(float, float, float)
00000000001afb86	movl	$0x1f0, %edi                    ## imm = 0x1F0
00000000001afb8b	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001afb90	movq	%rax, %r15
00000000001afb93	movq	%rax, %rdi
00000000001afb96	callq	__ZN13HGColorMatrixC1Ev         ## HGColorMatrix::HGColorMatrix()
00000000001afb9b	movss	0x1a4(%rbx), %xmm0
00000000001afba3	movq	%r15, %rdi
00000000001afba6	movaps	%xmm0, %xmm1
00000000001afba9	movaps	%xmm0, %xmm2
00000000001afbac	callq	__ZN13HGColorMatrix5ScaleEfff   ## HGColorMatrix::Scale(float, float, float)
00000000001afbb1	movq	(%r14), %rax
00000000001afbb4	movq	%r14, %rdi
00000000001afbb7	xorl	%esi, %esi
00000000001afbb9	movq	%r12, %rdx
00000000001afbbc	callq	*0x78(%rax)
00000000001afbbf	movq	(%r13), %rax
00000000001afbc3	movq	%r13, %rdi
00000000001afbc6	xorl	%esi, %esi
00000000001afbc8	movq	%r14, %rdx
00000000001afbcb	callq	*0x78(%rax)
00000000001afbce	movq	(%r15), %rax
00000000001afbd1	movq	%r15, %rdi
00000000001afbd4	xorl	%esi, %esi
00000000001afbd6	movq	%r13, %rdx
00000000001afbd9	callq	*0x78(%rax)
00000000001afbdc	movq	0x1b8(%rbx), %rdi
00000000001afbe3	movq	(%rdi), %rax
00000000001afbe6	movl	$0x1, %esi
00000000001afbeb	movq	%r15, %rdx
00000000001afbee	callq	*0x78(%rax)
00000000001afbf1	movq	(%r15), %rax
00000000001afbf4	movq	%r15, %rdi
00000000001afbf7	callq	*0x18(%rax)
00000000001afbfa	movq	(%r14), %rax
00000000001afbfd	movq	%r14, %rdi
00000000001afc00	callq	*0x18(%rax)
00000000001afc03	jmp	0x1afc29
00000000001afc05	movq	(%r13), %rax
00000000001afc09	movq	%r13, %rdi
00000000001afc0c	xorl	%esi, %esi
00000000001afc0e	movq	%r12, %rdx
00000000001afc11	callq	*0x78(%rax)
00000000001afc14	movq	0x1b8(%rbx), %rdi
00000000001afc1b	movq	(%rdi), %rax
00000000001afc1e	movl	$0x1, %esi
00000000001afc23	movq	%r13, %rdx
00000000001afc26	callq	*0x78(%rax)
00000000001afc29	movl	$0x220, %edi                    ## imm = 0x220
00000000001afc2e	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001afc33	movq	%rax, %r14
00000000001afc36	movq	%rax, %rdi
00000000001afc39	callq	__ZN6HGBlurC1Ev                 ## HGBlur::HGBlur()
00000000001afc3e	movss	0x19c(%rbx), %xmm0
00000000001afc46	movq	(%r14), %rax
00000000001afc49	movq	%r14, %rdi
00000000001afc4c	xorl	%esi, %esi
00000000001afc4e	movaps	%xmm0, %xmm1
00000000001afc51	movaps	%xmm0, %xmm2
00000000001afc54	movaps	%xmm0, %xmm3
00000000001afc57	callq	*0x60(%rax)
00000000001afc5a	movq	(%r14), %rax
00000000001afc5d	movq	%r14, %rdi
00000000001afc60	xorl	%esi, %esi
00000000001afc62	movq	-0x30(%rbp), %rdx
00000000001afc66	callq	*0x78(%rax)
00000000001afc69	movq	0x1b8(%rbx), %rdi
00000000001afc70	movq	(%rdi), %rax
00000000001afc73	xorl	%esi, %esi
00000000001afc75	movq	%r14, %rdx
00000000001afc78	callq	*0x78(%rax)
00000000001afc7b	movq	0x1b8(%rbx), %rdi
00000000001afc82	movq	(%rdi), %rax
00000000001afc85	movl	$0x2, %esi
00000000001afc8a	movq	-0x30(%rbp), %rdx
00000000001afc8e	callq	*0x78(%rax)
00000000001afc91	movq	0x1b8(%rbx), %rdi
00000000001afc98	movq	(%rdi), %rax
00000000001afc9b	movss	0x21801d(%rip), %xmm0
00000000001afca3	xorl	%esi, %esi
00000000001afca5	movaps	%xmm0, %xmm1
00000000001afca8	movaps	%xmm0, %xmm2
00000000001afcab	movaps	%xmm0, %xmm3
00000000001afcae	callq	*0x60(%rax)
00000000001afcb1	movq	0x1c0(%rbx), %rdi
00000000001afcb8	movq	(%rdi), %rax
00000000001afcbb	xorl	%esi, %esi
00000000001afcbd	movq	-0x40(%rbp), %rdx
00000000001afcc1	callq	*0x78(%rax)
00000000001afcc4	movq	0x1c0(%rbx), %rdi
00000000001afccb	movq	0x1b8(%rbx), %rdx
00000000001afcd2	movl	0x1ac(%rbx), %ecx
00000000001afcd8	movss	0x1a8(%rbx), %xmm0
00000000001afce0	movq	(%rdi), %rax
00000000001afce3	movl	$0x1, %esi
00000000001afce8	callq	*0x260(%rax)
00000000001afcee	movq	0x1c0(%rbx), %rbx
00000000001afcf5	movq	(%r14), %rax
00000000001afcf8	movq	%r14, %rdi
00000000001afcfb	callq	*0x18(%rax)
00000000001afcfe	movq	(%r13), %rax
00000000001afd02	movq	%r13, %rdi
00000000001afd05	callq	*0x18(%rax)
00000000001afd08	movq	(%r12), %rax
00000000001afd0c	movq	%r12, %rdi
00000000001afd0f	callq	*0x18(%rax)
00000000001afd12	movq	-0x40(%rbp), %rdi
00000000001afd16	movq	(%rdi), %rax
00000000001afd19	callq	*0x18(%rax)
00000000001afd1c	movq	-0x30(%rbp), %rdi
00000000001afd20	testq	%rdi, %rdi
00000000001afd23	je	0x1afd2b
00000000001afd25	movq	(%rdi), %rax
00000000001afd28	callq	*0x18(%rax)
00000000001afd2b	movq	-0x38(%rbp), %rdi
00000000001afd2f	testq	%rdi, %rdi
00000000001afd32	je	0x1afd3a
00000000001afd34	movq	(%rdi), %rax
00000000001afd37	callq	*0x18(%rax)
00000000001afd3a	movq	%rbx, %rax
00000000001afd3d	addq	$0x18, %rsp
00000000001afd41	popq	%rbx
00000000001afd42	popq	%r12
00000000001afd44	popq	%r13
00000000001afd46	popq	%r14
00000000001afd48	popq	%r15
00000000001afd4a	popq	%rbp
00000000001afd4b	retq
00000000001afd4c	movq	%rax, %rdi
00000000001afd4f	callq	___clang_call_terminate
00000000001afd54	movq	%rax, %rdi
00000000001afd57	callq	___clang_call_terminate
00000000001afd5c	movq	%rax, %rdi
00000000001afd5f	callq	___clang_call_terminate
00000000001afd64	movq	%rax, %rdi
00000000001afd67	callq	___clang_call_terminate
00000000001afd6c	movq	%rax, %rbx
00000000001afd6f	movq	%r15, %rdi
00000000001afd72	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001afd77	jmp	0x1afe3e
00000000001afd7c	movq	%rax, %rbx
00000000001afd7f	jmp	0x1afe3e
00000000001afd84	movq	%rax, %rbx
00000000001afd87	jmp	0x1afe3e
00000000001afd8c	jmp	0x1afdb6
00000000001afd8e	movq	%rax, %rbx
00000000001afd91	jmp	0x1afe74
00000000001afd96	movq	%rax, %rdi
00000000001afd99	callq	___clang_call_terminate
00000000001afd9e	movq	%rax, %rdi
00000000001afda1	callq	___clang_call_terminate
00000000001afda6	movq	%rax, %rdi
00000000001afda9	callq	___clang_call_terminate
00000000001afdae	movq	%rax, %rdi
00000000001afdb1	callq	___clang_call_terminate
00000000001afdb6	movq	%rax, %rbx
00000000001afdb9	movq	%r14, %rdi
00000000001afdbc	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001afdc1	jmp	0x1afe74
00000000001afdc6	movq	%rax, %rbx
00000000001afdc9	jmp	0x1afe74
00000000001afdce	movq	%rax, %rbx
00000000001afdd1	testq	%r13, %r13
00000000001afdd4	jne	0x1afe74
00000000001afdda	jmp	0x1afe7e
00000000001afddf	movq	%rax, %rbx
00000000001afde2	movq	%r13, %rdi
00000000001afde5	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001afdea	jmp	0x1afe7e
00000000001afdef	movq	%rax, %rbx
00000000001afdf2	jmp	0x1afe7e
00000000001afdf7	movq	%rax, %rbx
00000000001afdfa	movq	%r12, %rdi
00000000001afdfd	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001afe02	jmp	0x1afe88
00000000001afe07	movq	%rax, %rbx
00000000001afe0a	jmp	0x1afe88
00000000001afe0c	movq	%rax, %rbx
00000000001afe0f	movq	%r14, %rdi
00000000001afe12	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001afe17	jmp	0x1afe92
00000000001afe19	movq	%rax, %rbx
00000000001afe1c	jmp	0x1afe92
00000000001afe1e	movq	%rax, %rbx
00000000001afe21	jmp	0x1afe35
00000000001afe23	movq	%rax, %rbx
00000000001afe26	jmp	0x1afea3
00000000001afe28	movq	%rax, %rbx
00000000001afe2b	jmp	0x1afe74
00000000001afe2d	movq	%rax, %rbx
00000000001afe30	testq	%r15, %r15
00000000001afe33	je	0x1afe3e
00000000001afe35	movq	(%r15), %rax
00000000001afe38	movq	%r15, %rdi
00000000001afe3b	callq	*0x18(%rax)
00000000001afe3e	testq	%r14, %r14
00000000001afe41	je	0x1afe74
00000000001afe43	movq	(%r14), %rax
00000000001afe46	movq	%r14, %rdi
00000000001afe49	callq	*0x18(%rax)
00000000001afe4c	jmp	0x1afe74
00000000001afe4e	movq	%rax, %rdi
00000000001afe51	callq	___clang_call_terminate
00000000001afe56	movq	%rax, %rdi
00000000001afe59	callq	___clang_call_terminate
00000000001afe5e	movq	%rax, %rbx
00000000001afe61	jmp	0x1afe7e
00000000001afe63	movq	%rax, %rbx
00000000001afe66	jmp	0x1afe88
00000000001afe68	movq	%rax, %rbx
00000000001afe6b	movq	(%r14), %rax
00000000001afe6e	movq	%r14, %rdi
00000000001afe71	callq	*0x18(%rax)
00000000001afe74	movq	(%r13), %rax
00000000001afe78	movq	%r13, %rdi
00000000001afe7b	callq	*0x18(%rax)
00000000001afe7e	movq	(%r12), %rax
00000000001afe82	movq	%r12, %rdi
00000000001afe85	callq	*0x18(%rax)
00000000001afe88	movq	-0x40(%rbp), %rdi
00000000001afe8c	movq	(%rdi), %rax
00000000001afe8f	callq	*0x18(%rax)
00000000001afe92	cmpq	$0x0, -0x30(%rbp)
00000000001afe97	je	0x1afea3
00000000001afe99	movq	-0x30(%rbp), %rdi
00000000001afe9d	movq	(%rdi), %rax
00000000001afea0	callq	*0x18(%rax)
00000000001afea3	cmpq	$0x0, -0x38(%rbp)
00000000001afea8	je	0x1afeb4
00000000001afeaa	movq	-0x38(%rbp), %rdi
00000000001afeae	movq	(%rdi), %rax
00000000001afeb1	callq	*0x18(%rax)
00000000001afeb4	movq	%rbx, %rdi
00000000001afeb7	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001afebc	movq	%rax, %rdi
00000000001afebf	callq	___clang_call_terminate
00000000001afec4	movq	%rax, %rdi
00000000001afec7	callq	___clang_call_terminate
00000000001afecc	movq	%rax, %rdi
00000000001afecf	callq	___clang_call_terminate
00000000001afed4	movq	%rax, %rdi
00000000001afed7	callq	___clang_call_terminate
00000000001afedc	movq	%rax, %rdi
00000000001afedf	callq	___clang_call_terminate
00000000001afee4	movq	%rax, %rdi
00000000001afee7	callq	___clang_call_terminate
00000000001afeec	nopl	(%rax)

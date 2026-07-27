__ZN11OZSceneNode12parseElementER22PCSerializerReadStreamR15PCStreamElement:
0000000000091aa0	pushq	%rbp
0000000000091aa1	movq	%rsp, %rbp
0000000000091aa4	pushq	%r15
0000000000091aa6	pushq	%r14
0000000000091aa8	pushq	%r13
0000000000091aaa	pushq	%r12
0000000000091aac	pushq	%rbx
0000000000091aad	subq	$0x58, %rsp
0000000000091ab1	movq	%rdx, %r15
0000000000091ab4	movq	%rsi, %r14
0000000000091ab7	movq	%rdi, %rbx
0000000000091aba	leaq	-0x48(%rbp), %rdi
0000000000091abe	callq	0x6df0c0                        ## symbol stub for: __ZN8PCStringC1Ev
0000000000091ac3	leaq	-0x40(%rbp), %rdi
0000000000091ac7	callq	0x6df0c0                        ## symbol stub for: __ZN8PCStringC1Ev
0000000000091acc	leaq	-0x38(%rbp), %rdi
0000000000091ad0	callq	0x6df0c0                        ## symbol stub for: __ZN8PCStringC1Ev
0000000000091ad5	movq	$0x0, -0x58(%rbp)
0000000000091add	movl	$0x0, -0x4c(%rbp)
0000000000091ae4	movb	$0x0, -0x29(%rbp)
0000000000091ae8	testq	%rbx, %rbx
0000000000091aeb	je	0x91b36
0000000000091aed	leaq	__ZTI11OZSceneNode(%rip), %rsi  ## typeinfo for OZSceneNode
0000000000091af4	leaq	__ZTI13OZFxGenerator(%rip), %rdx ## typeinfo for OZFxGenerator
0000000000091afb	movq	%rbx, %rdi
0000000000091afe	xorl	%ecx, %ecx
0000000000091b00	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
0000000000091b05	testq	%rax, %rax
0000000000091b08	je	0x91b36
0000000000091b0a	movq	%rax, %r12
0000000000091b0d	addq	$0x4bb0, %r12                   ## imm = 0x4BB0
0000000000091b14	movq	0x4bb0(%rax), %rax
0000000000091b1b	movq	%r12, %rdi
0000000000091b1e	callq	*0xd0(%rax)
0000000000091b24	testb	%al, %al
0000000000091b26	je	0x91b36
0000000000091b28	movq	%r12, %rdi
0000000000091b2b	movq	%r14, %rsi
0000000000091b2e	movq	%r15, %rdx
0000000000091b31	callq	__ZN18OZFxPlugSharedBase24parseDynamicParamElementER22PCSerializerReadStreamR15PCStreamElement ## OZFxPlugSharedBase::parseDynamicParamElement(PCSerializerReadStream&, PCStreamElement&)
0000000000091b36	leaq	0x30(%rbx), %rdi
0000000000091b3a	movq	%r14, %rsi
0000000000091b3d	movq	%r15, %rdx
0000000000091b40	callq	__ZN19OZChannelObjectRoot12parseElementER22PCSerializerReadStreamR15PCStreamElement ## OZChannelObjectRoot::parseElement(PCSerializerReadStream&, PCStreamElement&)
0000000000091b45	movl	0x8(%r15), %eax
0000000000091b49	cmpl	$0xc7, %eax
0000000000091b4e	jg	0x91bbc
0000000000091b50	cmpl	$0x44, %eax
0000000000091b53	je	0x91bea
0000000000091b59	cmpl	$0x45, %eax
0000000000091b5c	jne	0x9206f
0000000000091b62	leaq	-0x50(%rbp), %rcx
0000000000091b66	movq	%r14, %rdi
0000000000091b69	movq	%r15, %rsi
0000000000091b6c	movl	$0x71, %edx
0000000000091b71	callq	0x6df798                        ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsUInt32ERK15PCStreamElementjPj
0000000000091b76	leaq	-0x48(%rbp), %rcx
0000000000091b7a	movq	%r14, %rdi
0000000000091b7d	movq	%r15, %rsi
0000000000091b80	movl	$0x6e, %edx
0000000000091b85	callq	0x6df792                        ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsStringERK15PCStreamElementjP8PCString
0000000000091b8a	leaq	-0x30(%rbp), %rcx
0000000000091b8e	movq	%r14, %rdi
0000000000091b91	movq	%r15, %rsi
0000000000091b94	movl	$0x6f, %edx
0000000000091b99	callq	0x6df798                        ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsUInt32ERK15PCStreamElementjPj
0000000000091b9e	cmpq	$0x0, 0x3f0(%rbx)
0000000000091ba6	je	0x91e47
0000000000091bac	movq	0x3e0(%rbx), %rax
0000000000091bb3	movq	0x10(%rax), %r15
0000000000091bb7	jmp	0x91e4a
0000000000091bbc	cmpl	$0xc9, %eax
0000000000091bc1	je	0x91d46
0000000000091bc7	cmpl	$0xc8, %eax
0000000000091bcc	jne	0x9206f
0000000000091bd2	addq	$0x3f8, %rbx                    ## imm = 0x3F8
0000000000091bd9	movq	(%r15), %rax
0000000000091bdc	movq	%r15, %rdi
0000000000091bdf	movq	%rbx, %rsi
0000000000091be2	callq	*0x20(%rax)
0000000000091be5	jmp	0x9206f
0000000000091bea	leaq	-0x50(%rbp), %rcx
0000000000091bee	movq	%r14, %rdi
0000000000091bf1	movq	%r15, %rsi
0000000000091bf4	movl	$0x71, %edx
0000000000091bf9	callq	0x6df798                        ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsUInt32ERK15PCStreamElementjPj
0000000000091bfe	leaq	-0x48(%rbp), %rcx
0000000000091c02	movq	%r14, %rdi
0000000000091c05	movq	%r15, %rsi
0000000000091c08	movl	$0x6e, %edx
0000000000091c0d	callq	0x6df792                        ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsStringERK15PCStreamElementjP8PCString
0000000000091c12	leaq	-0x30(%rbp), %rcx
0000000000091c16	movq	%r14, %rdi
0000000000091c19	movq	%r15, %rsi
0000000000091c1c	movl	$0x6f, %edx
0000000000091c21	callq	0x6df798                        ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsUInt32ERK15PCStreamElementjPj
0000000000091c26	leaq	-0x40(%rbp), %rcx
0000000000091c2a	movq	%r14, %rdi
0000000000091c2d	movq	%r15, %rsi
0000000000091c30	movl	$0x7, %edx
0000000000091c35	callq	0x6df792                        ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsStringERK15PCStreamElementjP8PCString
0000000000091c3a	leaq	-0x38(%rbp), %rcx
0000000000091c3e	movq	%r14, %rdi
0000000000091c41	movq	%r15, %rsi
0000000000091c44	movl	$0x76, %edx
0000000000091c49	callq	0x6df792                        ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsStringERK15PCStreamElementjP8PCString
0000000000091c4e	testb	%al, %al
0000000000091c50	jne	0x91c5f
0000000000091c52	leaq	-0x38(%rbp), %rdi
0000000000091c56	leaq	-0x48(%rbp), %rsi
0000000000091c5a	callq	0x6df048                        ## symbol stub for: __ZN8PCString3setERKS_
0000000000091c5f	leaq	-0x58(%rbp), %rcx
0000000000091c63	movq	%r14, %rdi
0000000000091c66	movq	%r15, %rsi
0000000000091c69	movl	$0x74, %edx
0000000000091c6e	callq	0x6df78c                        ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsDoubleERK15PCStreamElementjPd
0000000000091c73	leaq	-0x4c(%rbp), %rcx
0000000000091c77	movq	%r14, %rdi
0000000000091c7a	movq	%r15, %rsi
0000000000091c7d	movl	$0x8, %edx
0000000000091c82	callq	0x6df786                        ## symbol stub for: __ZNK22PCSerializerReadStream19getAttributeAsInt32ERK15PCStreamElementjPi
0000000000091c87	leaq	-0x29(%rbp), %rcx
0000000000091c8b	movq	%r14, %rdi
0000000000091c8e	movq	%r15, %rsi
0000000000091c91	movl	$0x9, %edx
0000000000091c96	callq	0x6df77a                        ## symbol stub for: __ZNK22PCSerializerReadStream18getAttributeAsBoolERK15PCStreamElementjPb
0000000000091c9b	leaq	_theApp(%rip), %rax
0000000000091ca2	movq	(%rax), %rax
0000000000091ca5	movl	-0x50(%rbp), %esi
0000000000091ca8	movq	0x20(%rax), %rdi
0000000000091cac	callq	0x6dd5ba                        ## symbol stub for: __ZN11OZFactories13lookupFactoryEj
0000000000091cb1	testq	%rax, %rax
0000000000091cb4	je	0x9206f
0000000000091cba	movq	0x790bb7(%rip), %rsi            ## literal pool symbol address: __ZTI9OZFactory
0000000000091cc1	movq	0x7951f8(%rip), %rdx            ## literal pool symbol address: __ZTI15OZEffectFactory
0000000000091cc8	movq	%rax, %rdi
0000000000091ccb	xorl	%ecx, %ecx
0000000000091ccd	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
0000000000091cd2	testq	%rax, %rax
0000000000091cd5	je	0x9206f
0000000000091cdb	movq	%rax, %r15
0000000000091cde	movq	0x7951db(%rip), %r12            ## literal pool symbol address: __ZTI15OZEffectFactory
0000000000091ce5	movq	0x795214(%rip), %rdx            ## literal pool symbol address: __ZTI18OZFxFilter_Factory
0000000000091cec	movq	%rax, %rdi
0000000000091cef	movq	%r12, %rsi
0000000000091cf2	xorl	%ecx, %ecx
0000000000091cf4	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
0000000000091cf9	movq	%rax, %r13
0000000000091cfc	movq	0x79539d(%rip), %rdx            ## literal pool symbol address: __ZTI36OZSnowflakeReplacementEffect_Factory
0000000000091d03	movq	%r15, %rdi
0000000000091d06	movq	%r12, %rsi
0000000000091d09	xorl	%ecx, %ecx
0000000000091d0b	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
0000000000091d10	testq	%rax, %rax
0000000000091d13	je	0x91f91
0000000000091d19	movq	%rax, %r12
0000000000091d1c	leaq	-0x40(%rbp), %rdi
0000000000091d20	callq	0x6dfa32                        ## symbol stub for: __ZNK8PCString5emptyEv
0000000000091d25	movl	-0x30(%rbp), %edx
0000000000091d28	testb	%al, %al
0000000000091d2a	je	0x91fcc
0000000000091d30	movsd	-0x58(%rbp), %xmm0
0000000000091d35	leaq	-0x38(%rbp), %rsi
0000000000091d39	movq	%r12, %rdi
0000000000091d3c	callq	__ZN36OZSnowflakeReplacementEffect_Factory15createOldEffectERK8PCStringjd ## OZSnowflakeReplacementEffect_Factory::createOldEffect(PCString const&, unsigned int, double)
0000000000091d41	jmp	0x9200a
0000000000091d46	leaq	-0x70(%rbp), %rdx
0000000000091d4a	movq	%r14, %rdi
0000000000091d4d	movq	%r15, %rsi
0000000000091d50	callq	0x6de784                        ## symbol stub for: __ZN22PCSerializerReadStream11getAsUInt32ER15PCStreamElementPj
0000000000091d55	movq	0x420(%rbx), %r14
0000000000091d5c	movq	0x428(%rbx), %rax
0000000000091d63	cmpq	%rax, %r14
0000000000091d66	jae	0x91d7a
0000000000091d68	movl	-0x70(%rbp), %eax
0000000000091d6b	movl	%eax, (%r14)
0000000000091d6e	addq	$0x4, %r14
0000000000091d72	movq	%r14, %r15
0000000000091d75	jmp	0x91e3b
0000000000091d7a	movq	0x418(%rbx), %rsi
0000000000091d81	subq	%rsi, %r14
0000000000091d84	movq	%r14, %r13
0000000000091d87	sarq	$0x2, %r13
0000000000091d8b	leaq	0x1(%r13), %rcx
0000000000091d8f	movq	%rcx, %rdx
0000000000091d92	shrq	$0x3e, %rdx
0000000000091d96	jne	0x920de
0000000000091d9c	movabsq	$0x3fffffffffffffff, %rdx       ## imm = 0x3FFFFFFFFFFFFFFF
0000000000091da6	subq	%rsi, %rax
0000000000091da9	movq	%rax, %r15
0000000000091dac	sarq	%r15
0000000000091daf	cmpq	%rcx, %r15
0000000000091db2	cmovbeq	%rcx, %r15
0000000000091db6	movabsq	$0x7ffffffffffffffc, %rcx       ## imm = 0x7FFFFFFFFFFFFFFC
0000000000091dc0	cmpq	%rcx, %rax
0000000000091dc3	cmovaeq	%rdx, %r15
0000000000091dc7	cmpq	%rdx, %r15
0000000000091dca	ja	0x920e5
0000000000091dd0	movq	%rsi, -0x80(%rbp)
0000000000091dd4	leaq	(,%r15,4), %rdi
0000000000091ddc	callq	0x6dfca2                        ## symbol stub for: __Znwm
0000000000091de1	leaq	(%rax,%r14), %r12
0000000000091de5	leaq	(%rax,%r15,4), %rcx
0000000000091de9	movq	%rcx, -0x78(%rbp)
0000000000091ded	movl	-0x70(%rbp), %ecx
0000000000091df0	movl	%ecx, (%rax,%r14)
0000000000091df4	leaq	(%rax,%r14), %r15
0000000000091df8	addq	$0x4, %r15
0000000000091dfc	shlq	$0x2, %r13
0000000000091e00	subq	%r13, %r12
0000000000091e03	movq	%r12, %rdi
0000000000091e06	movq	-0x80(%rbp), %r13
0000000000091e0a	movq	%r13, %rsi
0000000000091e0d	movq	%r14, %rdx
0000000000091e10	callq	0x6dff8a                        ## symbol stub for: _memcpy
0000000000091e15	movq	%r12, 0x418(%rbx)
0000000000091e1c	movq	%r15, 0x420(%rbx)
0000000000091e23	movq	-0x78(%rbp), %rax
0000000000091e27	movq	%rax, 0x428(%rbx)
0000000000091e2e	testq	%r13, %r13
0000000000091e31	je	0x91e3b
0000000000091e33	movq	%r13, %rdi
0000000000091e36	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000091e3b	movq	%r15, 0x420(%rbx)
0000000000091e42	jmp	0x9206f
0000000000091e47	xorl	%r15d, %r15d
0000000000091e4a	leaq	_theApp(%rip), %r12
0000000000091e51	movq	(%r12), %rax
0000000000091e55	movl	-0x50(%rbp), %esi
0000000000091e58	movq	0x20(%rax), %rdi
0000000000091e5c	callq	0x6dd5ba                        ## symbol stub for: __ZN11OZFactories13lookupFactoryEj
0000000000091e61	testq	%rax, %rax
0000000000091e64	je	0x91f06
0000000000091e6a	movq	0x790a07(%rip), %rsi            ## literal pool symbol address: __ZTI9OZFactory
0000000000091e71	movq	0x795070(%rip), %rdx            ## literal pool symbol address: __ZTI17OZBehaviorFactory
0000000000091e78	movq	%rax, %rdi
0000000000091e7b	xorl	%ecx, %ecx
0000000000091e7d	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
0000000000091e82	testq	%rax, %rax
0000000000091e85	je	0x91f06
0000000000091e87	movq	%rax, %r13
0000000000091e8a	movl	-0x30(%rbp), %edx
0000000000091e8d	movq	(%rax), %rax
0000000000091e90	leaq	-0x48(%rbp), %rsi
0000000000091e94	movq	%r13, %rdi
0000000000091e97	callq	*0xa8(%rax)
0000000000091e9d	movq	%rax, %r12
0000000000091ea0	testq	%rax, %rax
0000000000091ea3	je	0x9206f
0000000000091ea9	movaps	0x673840(%rip), %xmm0
0000000000091eb0	movaps	%xmm0, -0x70(%rbp)
0000000000091eb4	leaq	-0x70(%rbp), %rsi
0000000000091eb8	movq	%r13, %rdi
0000000000091ebb	callq	0x6dfab6                        ## symbol stub for: __ZNK9OZFactory13isKindOfClassE6PCUUID
0000000000091ec0	xorl	%ecx, %ecx
0000000000091ec2	testb	%al, %al
0000000000091ec4	cmovneq	%rcx, %r15
0000000000091ec8	movq	(%r12), %rax
0000000000091ecc	movq	%r12, %rdi
0000000000091ecf	callq	*0x138(%rax)
0000000000091ed5	movl	$0x40, %esi
0000000000091eda	movq	%rax, %rdi
0000000000091edd	xorl	%edx, %edx
0000000000091edf	callq	0x6dd92c                        ## symbol stub for: __ZN13OZChannelBase9resetFlagEyb
0000000000091ee4	movq	%rbx, %rdi
0000000000091ee7	movq	%r12, %rsi
0000000000091eea	movq	%r15, %rdx
0000000000091eed	callq	__ZN11OZSceneNode20insertBehaviorBeforeEP10OZBehaviorS1_ ## OZSceneNode::insertBehaviorBefore(OZBehavior*, OZBehavior*)
0000000000091ef2	addq	$0x28, %r12
0000000000091ef6	movq	%r14, %rdi
0000000000091ef9	movq	%r12, %rsi
0000000000091efc	callq	0x6de790                        ## symbol stub for: __ZN22PCSerializerReadStream11pushHandlerEP12PCSerializer
0000000000091f01	jmp	0x9206f
0000000000091f06	movq	(%r12), %rax
0000000000091f0a	movaps	0x6736df(%rip), %xmm0
0000000000091f11	movaps	%xmm0, -0x70(%rbp)
0000000000091f15	movq	0x20(%rax), %rdi
0000000000091f19	leaq	-0x70(%rbp), %rsi
0000000000091f1d	callq	0x6dd5ae                        ## symbol stub for: __ZN11OZFactories11findFactoryERK6PCUUID
0000000000091f22	movq	0x79094f(%rip), %rsi            ## literal pool symbol address: __ZTI9OZFactory
0000000000091f29	movq	0x794fb8(%rip), %rdx            ## literal pool symbol address: __ZTI17OZBehaviorFactory
0000000000091f30	movq	%rax, %rdi
0000000000091f33	xorl	%ecx, %ecx
0000000000091f35	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
0000000000091f3a	movl	-0x30(%rbp), %edx
0000000000091f3d	movq	(%rax), %rcx
0000000000091f40	leaq	-0x48(%rbp), %rsi
0000000000091f44	movq	%rax, %rdi
0000000000091f47	callq	*0xa8(%rcx)
0000000000091f4d	movq	%rax, %r12
0000000000091f50	testq	%rax, %rax
0000000000091f53	je	0x9206f
0000000000091f59	movq	(%r12), %rax
0000000000091f5d	movq	%r12, %rdi
0000000000091f60	callq	*0x138(%rax)
0000000000091f66	movl	$0x40, %esi
0000000000091f6b	movq	%rax, %rdi
0000000000091f6e	xorl	%edx, %edx
0000000000091f70	callq	0x6dd92c                        ## symbol stub for: __ZN13OZChannelBase9resetFlagEyb
0000000000091f75	movq	%rbx, %rdi
0000000000091f78	movq	%r12, %rsi
0000000000091f7b	movq	%r15, %rdx
0000000000091f7e	callq	__ZN11OZSceneNode20insertBehaviorBeforeEP10OZBehaviorS1_ ## OZSceneNode::insertBehaviorBefore(OZBehavior*, OZBehavior*)
0000000000091f83	movq	(%r14), %rax
0000000000091f86	movq	%r14, %rdi
0000000000091f89	callq	*0x28(%rax)
0000000000091f8c	jmp	0x9206f
0000000000091f91	testq	%r13, %r13
0000000000091f94	je	0x91fe2
0000000000091f96	leaq	-0x40(%rbp), %rdi
0000000000091f9a	callq	0x6dfa32                        ## symbol stub for: __ZNK8PCString5emptyEv
0000000000091f9f	movl	-0x30(%rbp), %edx
0000000000091fa2	movl	-0x4c(%rbp), %ecx
0000000000091fa5	movzbl	-0x29(%rbp), %esi
0000000000091fa9	movq	(%r13), %rdi
0000000000091fad	movq	0xc8(%rdi), %r9
0000000000091fb4	testb	%al, %al
0000000000091fb6	je	0x9209b
0000000000091fbc	movzbl	%sil, %r8d
0000000000091fc0	leaq	-0x38(%rbp), %rsi
0000000000091fc4	movq	%r13, %rdi
0000000000091fc7	callq	*%r9
0000000000091fca	jmp	0x9200a
0000000000091fcc	movl	-0x4c(%rbp), %ecx
0000000000091fcf	movq	(%r12), %rax
0000000000091fd3	leaq	-0x40(%rbp), %rsi
0000000000091fd7	movq	%r12, %rdi
0000000000091fda	callq	*0xc0(%rax)
0000000000091fe0	jmp	0x9200a
0000000000091fe2	leaq	-0x40(%rbp), %r12
0000000000091fe6	movq	%r12, %rdi
0000000000091fe9	callq	0x6dfa32                        ## symbol stub for: __ZNK8PCString5emptyEv
0000000000091fee	leaq	-0x38(%rbp), %rsi
0000000000091ff2	movl	-0x30(%rbp), %edx
0000000000091ff5	movq	(%r15), %rcx
0000000000091ff8	testb	%al, %al
0000000000091ffa	cmovneq	%rsi, %r12
0000000000091ffe	movq	%r15, %rdi
0000000000092001	movq	%r12, %rsi
0000000000092004	callq	*0xa8(%rcx)
000000000009200a	movq	%rax, %r15
000000000009200d	testq	%r15, %r15
0000000000092010	je	0x9206f
0000000000092012	movsd	-0x58(%rbp), %xmm0
0000000000092017	movq	(%r15), %rax
000000000009201a	movq	%r15, %rdi
000000000009201d	callq	*0x278(%rax)
0000000000092023	leaq	0x30(%r15), %rdi
0000000000092027	movq	0x30(%r15), %rax
000000000009202b	leaq	-0x48(%rbp), %rsi
000000000009202f	xorl	%edx, %edx
0000000000092031	callq	*0x70(%rax)
0000000000092034	movq	(%r15), %rax
0000000000092037	movq	%r15, %rdi
000000000009203a	callq	*0xf0(%rax)
0000000000092040	movl	$0x40, %esi
0000000000092045	movq	%rax, %rdi
0000000000092048	xorl	%edx, %edx
000000000009204a	callq	0x6dd92c                        ## symbol stub for: __ZN13OZChannelBase9resetFlagEyb
000000000009204f	movq	(%rbx), %rax
0000000000092052	movq	%rbx, %rdi
0000000000092055	movq	%r15, %rsi
0000000000092058	xorl	%edx, %edx
000000000009205a	callq	*0x158(%rax)
0000000000092060	addq	$0x48, %r15
0000000000092064	movq	%r14, %rdi
0000000000092067	movq	%r15, %rsi
000000000009206a	callq	0x6de790                        ## symbol stub for: __ZN22PCSerializerReadStream11pushHandlerEP12PCSerializer
000000000009206f	leaq	-0x38(%rbp), %rdi
0000000000092073	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
0000000000092078	leaq	-0x40(%rbp), %rdi
000000000009207c	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
0000000000092081	leaq	-0x48(%rbp), %rdi
0000000000092085	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
000000000009208a	movb	$0x1, %al
000000000009208c	addq	$0x58, %rsp
0000000000092090	popq	%rbx
0000000000092091	popq	%r12
0000000000092093	popq	%r13
0000000000092095	popq	%r14
0000000000092097	popq	%r15
0000000000092099	popq	%rbp
000000000009209a	retq
000000000009209b	movzbl	%sil, %r8d
000000000009209f	leaq	-0x40(%rbp), %rsi
00000000000920a3	movq	%r13, %rdi
00000000000920a6	callq	*%r9
00000000000920a9	movq	%rax, %r15
00000000000920ac	testq	%rax, %rax
00000000000920af	je	0x920ce
00000000000920b1	leaq	__ZTI8OZEffect(%rip), %rsi      ## typeinfo for OZEffect
00000000000920b8	leaq	__ZTI10OZFxFilter(%rip), %rdx   ## typeinfo for OZFxFilter
00000000000920bf	movq	%r15, %rdi
00000000000920c2	xorl	%ecx, %ecx
00000000000920c4	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
00000000000920c9	movq	%rax, %rdi
00000000000920cc	jmp	0x920d0
00000000000920ce	xorl	%edi, %edi
00000000000920d0	leaq	-0x38(%rbp), %rsi
00000000000920d4	callq	__ZN10OZFxFilter15setInternalNameERK8PCString ## OZFxFilter::setInternalName(PCString const&)
00000000000920d9	jmp	0x9200d
00000000000920de	callq	__ZNSt3__16vectorIjNS_9allocatorIjEEE20__throw_length_errorB9nqe210106Ev ## std::__1::vector<unsigned int, std::__1::allocator<unsigned int>>::__throw_length_error[abi:nqe210106]()
00000000000920e3	jmp	0x920ea
00000000000920e5	callq	__ZSt28__throw_bad_array_new_lengthB9nqe210106v ## std::__throw_bad_array_new_length[abi:nqe210106]()
00000000000920ea	ud2
00000000000920ec	movq	%rax, %rdi
00000000000920ef	callq	0x6dfcd8                        ## symbol stub for: ___cxa_begin_catch
00000000000920f4	movq	(%r14), %rax
00000000000920f7	movq	%r14, %rdi
00000000000920fa	callq	*0x18(%rax)
00000000000920fd	callq	0x6dfcde                        ## symbol stub for: ___cxa_end_catch
0000000000092102	jmp	0x9206f
0000000000092107	movq	%rax, %rbx
000000000009210a	callq	0x6dfcde                        ## symbol stub for: ___cxa_end_catch
000000000009210f	jmp	0x9213b
0000000000092111	movq	%rax, %rdi
0000000000092114	callq	___clang_call_terminate
0000000000092119	jmp	0x92138
000000000009211b	jmp	0x92138
000000000009211d	jmp	0x92138
000000000009211f	movq	%rax, %rbx
0000000000092122	jmp	0x92144
0000000000092124	movq	%rax, %rbx
0000000000092127	leaq	-0x48(%rbp), %rdi
000000000009212b	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
0000000000092130	movq	%rbx, %rdi
0000000000092133	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000092138	movq	%rax, %rbx
000000000009213b	leaq	-0x38(%rbp), %rdi
000000000009213f	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
0000000000092144	leaq	-0x40(%rbp), %rdi
0000000000092148	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
000000000009214d	leaq	-0x48(%rbp), %rdi
0000000000092151	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
0000000000092156	movq	%rbx, %rdi
0000000000092159	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000009215e	nop

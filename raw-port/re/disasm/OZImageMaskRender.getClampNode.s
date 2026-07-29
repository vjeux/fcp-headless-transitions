__ZN17OZImageMaskRender12getClampNodeER7LiAgent:
000000000046ed50	pushq	%rbp
000000000046ed51	movq	%rsp, %rbp
000000000046ed54	pushq	%r15
000000000046ed56	pushq	%r14
000000000046ed58	pushq	%r13
000000000046ed5a	pushq	%r12
000000000046ed5c	pushq	%rbx
000000000046ed5d	subq	$0xa8, %rsp
000000000046ed64	movq	%rdx, %r14
000000000046ed67	movq	%rsi, %r15
000000000046ed6a	movq	%rdi, %rbx
000000000046ed6d	leaq	-0xb0(%rbp), %rdi
000000000046ed74	callq	__ZN17OZImageMaskRender11calcStretchER7LiAgent ## OZImageMaskRender::calcStretch(LiAgent&)
000000000046ed79	movq	0x5d8(%r15), %rdi
000000000046ed80	movl	$0x1, %esi
000000000046ed85	callq	__ZN11OZImageMask13getMaskSourceEb ## OZImageMask::getMaskSource(bool)
000000000046ed8a	movq	%rax, %r12
000000000046ed8d	movq	0x5d8(%r15), %rdi
000000000046ed94	callq	__ZN11OZImageMask29getMaskSourcePixelAspectRatioEv ## OZImageMask::getMaskSourcePixelAspectRatio()
000000000046ed99	movsd	%xmm0, -0x30(%rbp)
000000000046ed9e	movq	0x5d8(%r15), %rax
000000000046eda5	movq	0x3b8(%rax), %rdi
000000000046edac	testq	%rdi, %rdi
000000000046edaf	je	0x46edd0
000000000046edb1	leaq	__ZTI11OZSceneNode(%rip), %rsi  ## typeinfo for OZSceneNode
000000000046edb8	leaq	__ZTI15OZTransformNode(%rip), %rdx ## typeinfo for OZTransformNode
000000000046edbf	xorl	%ecx, %ecx
000000000046edc1	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
000000000046edc6	movq	%rax, %r13
000000000046edc9	testq	%r12, %r12
000000000046edcc	jne	0x46edd8
000000000046edce	jmp	0x46ee3d
000000000046edd0	xorl	%r13d, %r13d
000000000046edd3	testq	%r12, %r12
000000000046edd6	je	0x46ee3d
000000000046edd8	leaq	__ZTI11OZImageNode(%rip), %rsi  ## typeinfo for OZImageNode
000000000046eddf	leaq	__ZTI11OZSceneNode(%rip), %rdx  ## typeinfo for OZSceneNode
000000000046ede6	movq	%r12, %rdi
000000000046ede9	movq	$-0x2, %rcx
000000000046edf0	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
000000000046edf5	testq	%rax, %rax
000000000046edf8	je	0x46ee3d
000000000046edfa	movq	0x8(%rax), %rdi
000000000046edfe	movapd	0x29880a(%rip), %xmm0
000000000046ee06	movapd	%xmm0, -0xd0(%rbp)
000000000046ee0e	leaq	-0xd0(%rbp), %rsi
000000000046ee15	callq	0x6dfab6                        ## symbol stub for: __ZNK9OZFactory13isKindOfClassE6PCUUID
000000000046ee1a	testb	%al, %al
000000000046ee1c	je	0x46ee3d
000000000046ee1e	movq	0x5d8(%r15), %rdi
000000000046ee25	movq	(%rdi), %rax
000000000046ee28	callq	*0x520(%rax)
000000000046ee2e	xorb	$0x1, %al
000000000046ee30	testq	%r12, %r12
000000000046ee33	setne	%cl
000000000046ee36	testq	%r13, %r13
000000000046ee39	jne	0x46ee4a
000000000046ee3b	jmp	0x46eeb7
000000000046ee3d	xorl	%eax, %eax
000000000046ee3f	testq	%r12, %r12
000000000046ee42	setne	%cl
000000000046ee45	testq	%r13, %r13
000000000046ee48	je	0x46eeb7
000000000046ee4a	orb	%al, %cl
000000000046ee4c	testb	$0x1, %cl
000000000046ee4f	je	0x46eeb7
000000000046ee51	movq	(%r13), %rax
000000000046ee55	movq	%r13, %rdi
000000000046ee58	callq	*0x548(%rax)
000000000046ee5e	movsd	-0x30(%rbp), %xmm2
000000000046ee63	divsd	%xmm0, %xmm2
000000000046ee67	ucomisd	0x296571(%rip), %xmm2
000000000046ee6f	jne	0x46ee73
000000000046ee71	jnp	0x46eeb7
000000000046ee73	movapd	%xmm2, %xmm1
000000000046ee77	movsd	-0xb0(%rbp), %xmm0
000000000046ee7f	mulsd	%xmm2, %xmm0
000000000046ee83	movsd	%xmm0, -0xb0(%rbp)
000000000046ee8b	movsd	-0x90(%rbp), %xmm0
000000000046ee93	mulsd	%xmm2, %xmm0
000000000046ee97	movsd	%xmm0, -0x90(%rbp)
000000000046ee9f	movsd	-0x70(%rbp), %xmm0
000000000046eea4	mulsd	%xmm2, %xmm0
000000000046eea8	movsd	%xmm0, -0x70(%rbp)
000000000046eead	mulsd	-0x50(%rbp), %xmm1
000000000046eeb2	movsd	%xmm1, -0x50(%rbp)
000000000046eeb7	movq	0x5d8(%r15), %r12
000000000046eebe	movq	0x20(%r15), %rax
000000000046eec2	movq	%rax, -0xc0(%rbp)
000000000046eec9	movupd	0x10(%r15), %xmm0
000000000046eecf	movapd	%xmm0, -0xd0(%rbp)
000000000046eed7	leaq	0x750(%r12), %rdi
000000000046eedf	leaq	-0xd0(%rbp), %r13
000000000046eee6	xorpd	%xmm0, %xmm0
000000000046eeea	movq	%r13, %rsi
000000000046eeed	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000046eef2	movsd	%xmm0, -0x30(%rbp)
000000000046eef7	addq	$0x7e8, %r12                    ## imm = 0x7E8
000000000046eefe	xorpd	%xmm0, %xmm0
000000000046ef02	movq	%r12, %rdi
000000000046ef05	movq	%r13, %rsi
000000000046ef08	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000046ef0d	movsd	-0x30(%rbp), %xmm3
000000000046ef12	xorpd	%xmm2, %xmm2
000000000046ef16	ucomisd	%xmm2, %xmm3
000000000046ef1a	jne	0x46ef1e
000000000046ef1c	jnp	0x46ef72
000000000046ef1e	movsd	-0xb0(%rbp), %xmm1
000000000046ef26	mulsd	%xmm3, %xmm1
000000000046ef2a	addsd	-0x98(%rbp), %xmm1
000000000046ef32	movsd	%xmm1, -0x98(%rbp)
000000000046ef3a	movsd	-0x90(%rbp), %xmm1
000000000046ef42	mulsd	%xmm3, %xmm1
000000000046ef46	addsd	-0x78(%rbp), %xmm1
000000000046ef4b	movsd	%xmm1, -0x78(%rbp)
000000000046ef50	movsd	-0x70(%rbp), %xmm1
000000000046ef55	mulsd	%xmm3, %xmm1
000000000046ef59	addsd	-0x58(%rbp), %xmm1
000000000046ef5e	movsd	%xmm1, -0x58(%rbp)
000000000046ef63	mulsd	-0x50(%rbp), %xmm3
000000000046ef68	addsd	-0x38(%rbp), %xmm3
000000000046ef6d	movsd	%xmm3, -0x38(%rbp)
000000000046ef72	ucomisd	%xmm2, %xmm0
000000000046ef76	jne	0x46ef7a
000000000046ef78	jnp	0x46efce
000000000046ef7a	movsd	-0xa8(%rbp), %xmm1
000000000046ef82	mulsd	%xmm0, %xmm1
000000000046ef86	addsd	-0x98(%rbp), %xmm1
000000000046ef8e	movsd	%xmm1, -0x98(%rbp)
000000000046ef96	movsd	-0x88(%rbp), %xmm1
000000000046ef9e	mulsd	%xmm0, %xmm1
000000000046efa2	addsd	-0x78(%rbp), %xmm1
000000000046efa7	movsd	%xmm1, -0x78(%rbp)
000000000046efac	movsd	-0x68(%rbp), %xmm1
000000000046efb1	mulsd	%xmm0, %xmm1
000000000046efb5	addsd	-0x58(%rbp), %xmm1
000000000046efba	movsd	%xmm1, -0x58(%rbp)
000000000046efbf	mulsd	-0x48(%rbp), %xmm0
000000000046efc4	addsd	-0x38(%rbp), %xmm0
000000000046efc9	movsd	%xmm0, -0x38(%rbp)
000000000046efce	leaq	-0xb0(%rbp), %rsi
000000000046efd5	movq	%r14, %rdi
000000000046efd8	callq	0x6deb68                        ## symbol stub for: __ZN7LiAgent13loadTransformERK14PCMatrix44TmplIdE
000000000046efdd	movq	0x5e0(%r15), %rdx
000000000046efe4	movq	%rbx, %rdi
000000000046efe7	movq	%r14, %rsi
000000000046efea	callq	0x6debb0                        ## symbol stub for: __ZN7LiAgent9getHeliumEP13LiImageSource
000000000046efef	movq	%rbx, %rax
000000000046eff2	addq	$0xa8, %rsp
000000000046eff9	popq	%rbx
000000000046effa	popq	%r12
000000000046effc	popq	%r13
000000000046effe	popq	%r14
000000000046f000	popq	%r15
000000000046f002	popq	%rbp
000000000046f003	retq
000000000046f004	nopw	%cs:(%rax,%rax)

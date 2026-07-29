__ZN18OZSceneArrangementC2EP7OZSceneid:
0000000000503f70	pushq	%rbp
0000000000503f71	movq	%rsp, %rbp
0000000000503f74	pushq	%r15
0000000000503f76	pushq	%r14
0000000000503f78	pushq	%r13
0000000000503f7a	pushq	%r12
0000000000503f7c	pushq	%rbx
0000000000503f7d	subq	$0xc8, %rsp
0000000000503f84	movsd	%xmm0, -0x40(%rbp)
0000000000503f89	movl	%edx, %r12d
0000000000503f8c	movq	%rsi, %rbx
0000000000503f8f	movq	%rdi, %r15
0000000000503f92	callq	__ZN13OZRenderStateC1Ev         ## OZRenderState::OZRenderState()
0000000000503f97	leaq	0x108(%r15), %rax
0000000000503f9e	movq	%rax, -0x38(%rbp)
0000000000503fa2	leaq	__ZTV7PCArrayIN18OZSceneArrangement7ElementE14PCArray_TraitsIS1_EE(%rip), %rax ## vtable for PCArray<OZSceneArrangement::Element, PCArray_Traits<OZSceneArrangement::Element>>
0000000000503fa9	addq	$0x10, %rax
0000000000503fad	movq	%rax, 0x108(%r15)
0000000000503fb4	xorps	%xmm0, %xmm0
0000000000503fb7	movups	%xmm0, 0x110(%r15)
0000000000503fbf	leaq	0x120(%r15), %rcx
0000000000503fc6	movq	%rcx, -0x30(%rbp)
0000000000503fca	movq	%rax, 0x120(%r15)
0000000000503fd1	movups	%xmm0, 0x128(%r15)
0000000000503fd9	movl	%r12d, 0x138(%r15)
0000000000503fe0	movsd	-0x40(%rbp), %xmm0
0000000000503fe5	movsd	%xmm0, 0x140(%r15)
0000000000503fee	leaq	-0xa0(%rbp), %rdi
0000000000503ff5	movq	%rbx, %rsi
0000000000503ff8	callq	__ZNK7OZScene14getCurrentTimeEv ## OZScene::getCurrentTime() const
0000000000503ffd	movq	-0x90(%rbp), %rax
0000000000504004	movq	%rax, 0x10(%r15)
0000000000504008	movups	-0xa0(%rbp), %xmm0
000000000050400f	movups	%xmm0, (%r15)
0000000000504013	movsd	0xc0(%rbx), %xmm0
000000000050401b	movsd	%xmm0, 0x28(%r15)
0000000000504021	leaq	-0xa0(%rbp), %rdi
0000000000504028	movq	%rbx, %rsi
000000000050402b	callq	__ZN7OZScene9begin_selEv        ## OZScene::begin_sel()
0000000000504030	leaq	-0xe8(%rbp), %rdi
0000000000504037	movq	%rbx, %rsi
000000000050403a	callq	__ZN7OZScene7end_selEv          ## OZScene::end_sel()
000000000050403f	movq	-0xa0(%rbp), %rax
0000000000504046	cmpq	-0xe8(%rbp), %rax
000000000050404d	je	0x5041df
0000000000504053	movq	-0x90(%rbp), %rcx
000000000050405a	leaq	-0xa0(%rbp), %r13
0000000000504061	leaq	__ZTI11OZSceneNode(%rip), %r14  ## typeinfo for OZSceneNode
0000000000504068	leaq	__ZTI9OZElement(%rip), %rbx     ## typeinfo for OZElement
000000000050406f	jmp	0x504090
0000000000504071	nopw	%cs:(%rax,%rax)
0000000000504080	movq	%rax, %rcx
0000000000504083	cmpq	-0xe8(%rbp), %rax
000000000050408a	je	0x5041df
0000000000504090	cmpq	%rcx, %rax
0000000000504093	je	0x504170
0000000000504099	movq	0x10(%rax), %rdi
000000000050409d	testq	%rdi, %rdi
00000000005040a0	je	0x504170
00000000005040a6	movq	%r14, %rsi
00000000005040a9	movq	%rbx, %rdx
00000000005040ac	xorl	%ecx, %ecx
00000000005040ae	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
00000000005040b3	testq	%rax, %rax
00000000005040b6	je	0x504170
00000000005040bc	leaq	-0x58(%rbp), %rdi
00000000005040c0	movq	%rax, %rsi
00000000005040c3	movq	%r15, %rcx
00000000005040c6	movl	%r12d, %r8d
00000000005040c9	movsd	-0x40(%rbp), %xmm0
00000000005040ce	callq	__ZN18OZSceneArrangement7ElementC2EP9OZElementP7OZSceneRK13OZRenderStateid ## OZSceneArrangement::Element::Element(OZElement*, OZScene*, OZRenderState const&, int, double)
00000000005040d3	movl	0x110(%r15), %eax
00000000005040da	movl	0x114(%r15), %ecx
00000000005040e1	leal	0x1(%rcx), %esi
00000000005040e4	cmpl	%eax, %ecx
00000000005040e6	leal	0x3(%rcx,%rcx), %edx
00000000005040ea	cmovll	%eax, %edx
00000000005040ed	movq	-0x38(%rbp), %rdi
00000000005040f1	callq	__ZN7PCArrayIN18OZSceneArrangement7ElementE14PCArray_TraitsIS1_EE6resizeEii ## PCArray<OZSceneArrangement::Element, PCArray_Traits<OZSceneArrangement::Element>>::resize(int, int)
00000000005040f6	movq	0x118(%r15), %rax
00000000005040fd	movslq	0x114(%r15), %rcx
0000000000504104	leaq	(%rcx,%rcx,2), %rcx
0000000000504108	movzwl	-0x48(%rbp), %edx
000000000050410c	movw	%dx, -0x8(%rax,%rcx,8)
0000000000504111	movups	-0x58(%rbp), %xmm0
0000000000504115	movups	%xmm0, -0x18(%rax,%rcx,8)
000000000050411a	cmpb	$0x1, -0x47(%rbp)
000000000050411e	jne	0x504170
0000000000504120	movl	0x128(%r15), %eax
0000000000504127	movl	0x12c(%r15), %ecx
000000000050412e	leal	0x1(%rcx), %esi
0000000000504131	cmpl	%eax, %ecx
0000000000504133	leal	0x3(%rcx,%rcx), %edx
0000000000504137	cmovll	%eax, %edx
000000000050413a	movq	-0x30(%rbp), %rdi
000000000050413e	callq	__ZN7PCArrayIN18OZSceneArrangement7ElementE14PCArray_TraitsIS1_EE6resizeEii ## PCArray<OZSceneArrangement::Element, PCArray_Traits<OZSceneArrangement::Element>>::resize(int, int)
0000000000504143	movq	0x130(%r15), %rax
000000000050414a	movslq	0x12c(%r15), %rcx
0000000000504151	leaq	(%rcx,%rcx,2), %rcx
0000000000504155	movzwl	-0x48(%rbp), %edx
0000000000504159	movw	%dx, -0x8(%rax,%rcx,8)
000000000050415e	movups	-0x58(%rbp), %xmm0
0000000000504162	movups	%xmm0, -0x18(%rax,%rcx,8)
0000000000504167	nopw	(%rax,%rax)
0000000000504170	movq	%r13, %rdi
0000000000504173	callq	__ZN8OZObject10iterator_tI15OZSceneNodeFileLb0ELb1ENS_16defaultValidatorEE9incrementEv ## OZObject::iterator_t<OZSceneNodeFile, false, true, OZObject::defaultValidator>::increment()
0000000000504178	movq	-0xa0(%rbp), %rax
000000000050417f	cmpq	-0x90(%rbp), %rax
0000000000504186	je	0x504080
000000000050418c	nopl	(%rax)
0000000000504190	movq	0x10(%rax), %rdi
0000000000504194	movq	(%rdi), %rax
0000000000504197	callq	*0x2a8(%rax)
000000000050419d	testb	%al, %al
000000000050419f	je	0x5041bf
00000000005041a1	movq	-0xa0(%rbp), %rax
00000000005041a8	movq	-0x90(%rbp), %rcx
00000000005041af	cmpq	%rcx, %rax
00000000005041b2	je	0x5041bf
00000000005041b4	cmpq	$0x0, 0x10(%rax)
00000000005041b9	jne	0x504083
00000000005041bf	movq	%r13, %rdi
00000000005041c2	callq	__ZN8OZObject10iterator_tI15OZSceneNodeFileLb0ELb1ENS_16defaultValidatorEE9incrementEv ## OZObject::iterator_t<OZSceneNodeFile, false, true, OZObject::defaultValidator>::increment()
00000000005041c7	movq	-0xa0(%rbp), %rax
00000000005041ce	movq	%rax, %rcx
00000000005041d1	cmpq	-0x90(%rbp), %rax
00000000005041d8	jne	0x504190
00000000005041da	jmp	0x504083
00000000005041df	movl	0x114(%r15), %esi
00000000005041e6	testq	%rsi, %rsi
00000000005041e9	je	0x504203
00000000005041eb	movq	0x118(%r15), %rdi
00000000005041f2	leaq	__ZN7PCArrayIN18OZSceneArrangement7ElementE14PCArray_TraitsIS1_EE9less_thanEPKvS6_(%rip), %rcx ## PCArray<OZSceneArrangement::Element, PCArray_Traits<OZSceneArrangement::Element>>::less_than(void const*, void const*)
00000000005041f9	movl	$0x18, %edx
00000000005041fe	callq	0x6e00c8                        ## symbol stub for: _qsort
0000000000504203	movq	-0xb8(%rbp), %rdi
000000000050420a	testq	%rdi, %rdi
000000000050420d	je	0x504220
000000000050420f	nop
0000000000504210	movq	(%rdi), %rbx
0000000000504213	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000504218	movq	%rbx, %rdi
000000000050421b	testq	%rbx, %rbx
000000000050421e	jne	0x504210
0000000000504220	movq	-0xc8(%rbp), %rdi
0000000000504227	movq	$0x0, -0xc8(%rbp)
0000000000504232	testq	%rdi, %rdi
0000000000504235	je	0x50423c
0000000000504237	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
000000000050423c	movq	-0x70(%rbp), %rdi
0000000000504240	testq	%rdi, %rdi
0000000000504243	je	0x504260
0000000000504245	nopw	%cs:(%rax,%rax)
0000000000504250	movq	(%rdi), %rbx
0000000000504253	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000504258	movq	%rbx, %rdi
000000000050425b	testq	%rbx, %rbx
000000000050425e	jne	0x504250
0000000000504260	movq	-0x80(%rbp), %rdi
0000000000504264	movq	$0x0, -0x80(%rbp)
000000000050426c	testq	%rdi, %rdi
000000000050426f	je	0x504276
0000000000504271	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000504276	addq	$0xc8, %rsp
000000000050427d	popq	%rbx
000000000050427e	popq	%r12
0000000000504280	popq	%r13
0000000000504282	popq	%r14
0000000000504284	popq	%r15
0000000000504286	popq	%rbp
0000000000504287	retq
0000000000504288	jmp	0x50429d
000000000050428a	movq	%rax, %rbx
000000000050428d	jmp	0x5042ac
000000000050428f	movq	%rax, %rbx
0000000000504292	jmp	0x5042b8
0000000000504294	movq	%rax, %rbx
0000000000504297	jmp	0x5042b8
0000000000504299	jmp	0x50429d
000000000050429b	jmp	0x50429d
000000000050429d	movq	%rax, %rbx
00000000005042a0	leaq	-0xe8(%rbp), %rdi
00000000005042a7	callq	__ZN8OZObject10iterator_tI14OZImageElementLb1ELb1E17dropZoneValidatorED1Ev ## OZObject::iterator_t<OZImageElement, true, true, dropZoneValidator>::~iterator_t()
00000000005042ac	leaq	-0xa0(%rbp), %rdi
00000000005042b3	callq	__ZN8OZObject10iterator_tI14OZImageElementLb1ELb1E17dropZoneValidatorED1Ev ## OZObject::iterator_t<OZImageElement, true, true, dropZoneValidator>::~iterator_t()
00000000005042b8	movq	-0x30(%rbp), %rdi
00000000005042bc	callq	__ZN7PCArrayIN18OZSceneArrangement7ElementE14PCArray_TraitsIS1_EED1Ev ## PCArray<OZSceneArrangement::Element, PCArray_Traits<OZSceneArrangement::Element>>::~PCArray()
00000000005042c1	movq	-0x38(%rbp), %rdi
00000000005042c5	callq	__ZN7PCArrayIN18OZSceneArrangement7ElementE14PCArray_TraitsIS1_EED1Ev ## PCArray<OZSceneArrangement::Element, PCArray_Traits<OZSceneArrangement::Element>>::~PCArray()
00000000005042ca	movq	%rbx, %rdi
00000000005042cd	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000005042d2	nopw	%cs:(%rax,%rax)

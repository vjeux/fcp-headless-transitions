__ZN30OZ3DEnginePhysicsFieldBehavior19getLockDependenciesEP9OZLockingP15PCDirectedGraphIS1_EPNSt3__13setIS1_NS5_4lessIS1_EENS5_9allocatorIS1_EEEE:
00000000004f11b0	pushq	%rbp
00000000004f11b1	movq	%rsp, %rbp
00000000004f11b4	pushq	%r15
00000000004f11b6	pushq	%r14
00000000004f11b8	pushq	%r13
00000000004f11ba	pushq	%r12
00000000004f11bc	pushq	%rbx
00000000004f11bd	subq	$0x18, %rsp
00000000004f11c1	movq	%rcx, %rbx
00000000004f11c4	movq	%rdx, %r15
00000000004f11c7	leaq	0x148(%rdi), %r14
00000000004f11ce	leaq	0x8(%rcx), %r13
00000000004f11d2	movq	0x8(%rcx), %rax
00000000004f11d6	movq	%r13, %r12
00000000004f11d9	movq	%r13, -0x30(%rbp)
00000000004f11dd	testq	%rax, %rax
00000000004f11e0	je	0x4f1237
00000000004f11e2	movq	%rax, %rcx
00000000004f11e5	jmp	0x4f11f8
00000000004f11e7	nopw	(%rax,%rax)
00000000004f11f0	movq	(%rcx), %rcx
00000000004f11f3	testq	%rcx, %rcx
00000000004f11f6	je	0x4f121c
00000000004f11f8	movq	0x20(%rcx), %rdx
00000000004f11fc	cmpq	%rdx, %r14
00000000004f11ff	jb	0x4f11f0
00000000004f1201	jbe	0x4f12d2
00000000004f1207	addq	$0x8, %rcx
00000000004f120b	jmp	0x4f11f0
00000000004f120d	nopl	(%rax)
00000000004f1210	movq	(%r13), %rax
00000000004f1214	movq	%r13, %r12
00000000004f1217	testq	%rax, %rax
00000000004f121a	je	0x4f1237
00000000004f121c	movq	%rax, %r13
00000000004f121f	movq	0x20(%rax), %rax
00000000004f1223	cmpq	%rax, %r14
00000000004f1226	jb	0x4f1210
00000000004f1228	jbe	0x4f127f
00000000004f122a	movq	0x8(%r13), %rax
00000000004f122e	testq	%rax, %rax
00000000004f1231	jne	0x4f121c
00000000004f1233	leaq	0x8(%r13), %r12
00000000004f1237	movq	%r15, -0x38(%rbp)
00000000004f123b	movq	%rdi, %r15
00000000004f123e	movl	$0x28, %edi
00000000004f1243	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000004f1248	movq	%r14, 0x20(%rax)
00000000004f124c	xorps	%xmm0, %xmm0
00000000004f124f	movups	%xmm0, (%rax)
00000000004f1252	movq	%r13, 0x10(%rax)
00000000004f1256	movq	%rax, (%r12)
00000000004f125a	movq	(%rbx), %rcx
00000000004f125d	movq	(%rcx), %rcx
00000000004f1260	testq	%rcx, %rcx
00000000004f1263	je	0x4f1268
00000000004f1265	movq	%rcx, (%rbx)
00000000004f1268	movq	0x8(%rbx), %rdi
00000000004f126c	movq	%rax, %rsi
00000000004f126f	callq	__ZNSt3__127__tree_balance_after_insertB9nqe210106IPNS_16__tree_node_baseIPvEEEEvT_S5_ ## void std::__1::__tree_balance_after_insert[abi:nqe210106]<std::__1::__tree_node_base<void*>*>(std::__1::__tree_node_base<void*>*, std::__1::__tree_node_base<void*>*)
00000000004f1274	incq	0x10(%rbx)
00000000004f1278	movq	%r15, %rdi
00000000004f127b	movq	-0x38(%rbp), %r15
00000000004f127f	movq	(%rdi), %rax
00000000004f1282	callq	*0x150(%rax)
00000000004f1288	movq	%r14, %rdi
00000000004f128b	movq	%rax, %rsi
00000000004f128e	movq	%r15, %rdx
00000000004f1291	movq	%rbx, %rcx
00000000004f1294	callq	__ZN9OZLocking32addLockDependenciesForDependentsEPS_P7OZSceneP15PCDirectedGraphIS0_EPNSt3__13setIS0_NS6_4lessIS0_EENS6_9allocatorIS0_EEEE ## OZLocking::addLockDependenciesForDependents(OZLocking*, OZScene*, PCDirectedGraph<OZLocking*>*, std::__1::set<OZLocking*, std::__1::less<OZLocking*>, std::__1::allocator<OZLocking*>>*)
00000000004f1299	movq	0x8(%rbx), %rdi
00000000004f129d	testq	%rdi, %rdi
00000000004f12a0	je	0x4f12d2
00000000004f12a2	movq	-0x30(%rbp), %r15
00000000004f12a6	movq	%rdi, %rax
00000000004f12a9	nopl	(%rax)
00000000004f12b0	xorl	%ecx, %ecx
00000000004f12b2	cmpq	%r14, 0x20(%rax)
00000000004f12b6	setb	%cl
00000000004f12b9	cmovaeq	%rax, %r15
00000000004f12bd	movq	(%rax,%rcx,8), %rax
00000000004f12c1	testq	%rax, %rax
00000000004f12c4	jne	0x4f12b0
00000000004f12c6	cmpq	-0x30(%rbp), %r15
00000000004f12ca	je	0x4f12d2
00000000004f12cc	cmpq	0x20(%r15), %r14
00000000004f12d0	jae	0x4f12e1
00000000004f12d2	addq	$0x18, %rsp
00000000004f12d6	popq	%rbx
00000000004f12d7	popq	%r12
00000000004f12d9	popq	%r13
00000000004f12db	popq	%r14
00000000004f12dd	popq	%r15
00000000004f12df	popq	%rbp
00000000004f12e0	retq
00000000004f12e1	movq	0x8(%r15), %rcx
00000000004f12e5	testq	%rcx, %rcx
00000000004f12e8	je	0x4f12fd
00000000004f12ea	nopw	(%rax,%rax)
00000000004f12f0	movq	%rcx, %rax
00000000004f12f3	movq	(%rcx), %rcx
00000000004f12f6	testq	%rcx, %rcx
00000000004f12f9	jne	0x4f12f0
00000000004f12fb	jmp	0x4f130c
00000000004f12fd	movq	%r15, %rcx
00000000004f1300	movq	0x10(%rcx), %rax
00000000004f1304	cmpq	(%rax), %rcx
00000000004f1307	movq	%rax, %rcx
00000000004f130a	jne	0x4f1300
00000000004f130c	cmpq	%r15, (%rbx)
00000000004f130f	jne	0x4f1314
00000000004f1311	movq	%rax, (%rbx)
00000000004f1314	decq	0x10(%rbx)
00000000004f1318	movq	%r15, %rsi
00000000004f131b	callq	__ZNSt3__113__tree_removeB9nqe210106IPNS_16__tree_node_baseIPvEEEEvT_S5_ ## void std::__1::__tree_remove[abi:nqe210106]<std::__1::__tree_node_base<void*>*>(std::__1::__tree_node_base<void*>*, std::__1::__tree_node_base<void*>*)
00000000004f1320	movq	%r15, %rdi
00000000004f1323	addq	$0x18, %rsp
00000000004f1327	popq	%rbx
00000000004f1328	popq	%r12
00000000004f132a	popq	%r13
00000000004f132c	popq	%r14
00000000004f132e	popq	%r15
00000000004f1330	popq	%rbp
00000000004f1331	jmp	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000004f1336	nopw	%cs:(%rax,%rax)

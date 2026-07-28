__ZN28HGRenderQueueSetupPropertiesC2Ev:
00000000000710b0	pushq	%rbp
00000000000710b1	movq	%rsp, %rbp
00000000000710b4	pushq	%r15
00000000000710b6	pushq	%r14
00000000000710b8	pushq	%r12
00000000000710ba	pushq	%rbx
00000000000710bb	subq	$0x10, %rsp
00000000000710bf	movq	%rdi, %rbx
00000000000710c2	callq	__ZN8HGObjectC2Ev               ## HGObject::HGObject()
00000000000710c7	leaq	__ZTV28HGRenderQueueSetupProperties(%rip), %rax ## vtable for HGRenderQueueSetupProperties
00000000000710ce	addq	$0x10, %rax
00000000000710d2	movq	%rax, (%rbx)
00000000000710d5	callq	__ZN22HGComputeDeviceManager20GetComputeDeviceListEv ## HGComputeDeviceManager::GetComputeDeviceList()
00000000000710da	leaq	0x10(%rbx), %rcx
00000000000710de	xorps	%xmm0, %xmm0
00000000000710e1	movups	%xmm0, 0x10(%rbx)
00000000000710e5	movq	$0x0, 0x20(%rbx)
00000000000710ed	movq	(%rax), %r15
00000000000710f0	movq	0x8(%rax), %r12
00000000000710f4	movq	%r12, %r14
00000000000710f7	movq	%rcx, -0x30(%rbp)
00000000000710fb	movb	$0x0, -0x28(%rbp)
00000000000710ff	subq	%r15, %r14
0000000000071102	je	0x71158
0000000000071104	js	0x711bf
000000000007110a	movq	%r14, %rdi
000000000007110d	callq	0x3c4fb2                        ## symbol stub for: __Znwm
0000000000071112	movq	%rax, 0x10(%rbx)
0000000000071116	movq	%rax, 0x18(%rbx)
000000000007111a	addq	%rax, %r14
000000000007111d	movq	%r14, 0x20(%rbx)
0000000000071121	jmp	0x7113d
0000000000071123	nopw	%cs:(%rax,%rax)
0000000000071130	addq	$0x10, %r15
0000000000071134	addq	$0x10, %rax
0000000000071138	cmpq	%r12, %r15
000000000007113b	je	0x71154
000000000007113d	movq	0x8(%r15), %rcx
0000000000071141	movups	(%r15), %xmm0
0000000000071145	movups	%xmm0, (%rax)
0000000000071148	testq	%rcx, %rcx
000000000007114b	je	0x71130
000000000007114d	lock
000000000007114e	incq	0x8(%rcx)
0000000000071152	jmp	0x71130
0000000000071154	movq	%rax, 0x18(%rbx)
0000000000071158	movq	$0x2, 0x28(%rbx)
0000000000071160	movq	$0x3, 0x30(%rbx)
0000000000071168	movq	$0x1, 0x38(%rbx)
0000000000071170	movq	$0x3, 0x40(%rbx)
0000000000071178	movl	$0x10101, 0x48(%rbx)            ## imm = 0x10101
000000000007117f	movb	$0x1, 0x4c(%rbx)
0000000000071183	movq	$0x0, 0x50(%rbx)
000000000007118b	movq	$0x60, 0x58(%rbx)
0000000000071193	movq	$0x60, 0x60(%rbx)
000000000007119b	movq	$0x0, 0x68(%rbx)
00000000000711a3	movl	$0x1b, 0x70(%rbx)
00000000000711aa	movq	$0x0, 0x78(%rbx)
00000000000711b2	addq	$0x10, %rsp
00000000000711b6	popq	%rbx
00000000000711b7	popq	%r12
00000000000711b9	popq	%r14
00000000000711bb	popq	%r15
00000000000711bd	popq	%rbp
00000000000711be	retq
00000000000711bf	callq	__ZNSt3__16vectorINS_10shared_ptrIK15HGComputeDeviceEENS_9allocatorIS4_EEE20__throw_length_errorB9nqe210106Ev ## std::__1::vector<std::__1::shared_ptr<HGComputeDevice const>, std::__1::allocator<std::__1::shared_ptr<HGComputeDevice const>>>::__throw_length_error[abi:nqe210106]()
00000000000711c4	ud2
00000000000711c6	movq	%rax, %r14
00000000000711c9	movq	%rbx, %rdi
00000000000711cc	callq	__ZN8HGObjectD2Ev               ## HGObject::~HGObject()
00000000000711d1	movq	%r14, %rdi
00000000000711d4	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000711d9	movq	%rax, %r14
00000000000711dc	leaq	-0x30(%rbp), %rdi
00000000000711e0	callq	__ZNSt3__128__exception_guard_exceptionsINS_6vectorINS_10shared_ptrIK15HGComputeDeviceEENS_9allocatorIS5_EEE16__destroy_vectorEED1B9nqe210106Ev ## std::__1::__exception_guard_exceptions<std::__1::vector<std::__1::shared_ptr<HGComputeDevice const>, std::__1::allocator<std::__1::shared_ptr<HGComputeDevice const>>>::__destroy_vector>::~__exception_guard_exceptions[abi:nqe210106]()
00000000000711e5	movq	%rbx, %rdi
00000000000711e8	callq	__ZN8HGObjectD2Ev               ## HGObject::~HGObject()
00000000000711ed	movq	%r14, %rdi
00000000000711f0	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000711f5	nopw	%cs:(%rax,%rax)

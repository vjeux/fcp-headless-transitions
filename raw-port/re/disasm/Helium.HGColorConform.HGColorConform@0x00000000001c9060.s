__ZN14HGColorConformC2Ev:
00000000001c9060	pushq	%rbp
00000000001c9061	movq	%rsp, %rbp
00000000001c9064	pushq	%r15
00000000001c9066	pushq	%r14
00000000001c9068	pushq	%rbx
00000000001c9069	pushq	%rax
00000000001c906a	movq	%rdi, %rbx
00000000001c906d	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
00000000001c9072	leaq	0x860c27(%rip), %rax
00000000001c9079	movq	%rax, (%rbx)
00000000001c907c	movb	$0x0, 0x30d(%rbx)
00000000001c9083	xorps	%xmm0, %xmm0
00000000001c9086	movups	%xmm0, 0x358(%rbx)
00000000001c908d	leaq	__ZL35hgColorConformNodeListCacheLockInit(%rip), %rdi ## hgColorConformNodeListCacheLockInit
00000000001c9094	leaq	__Z43hgColorConformNodeListCacheLockInitFunctionv(%rip), %rsi ## hgColorConformNodeListCacheLockInitFunction()
00000000001c909b	callq	0x3c5576                        ## symbol stub for: _pthread_once
00000000001c90a0	movw	$0x0, 0x1b0(%rbx)
00000000001c90a9	movb	$0x0, 0x1b2(%rbx)
00000000001c90b0	xorps	%xmm0, %xmm0
00000000001c90b3	movups	%xmm0, 0x198(%rbx)
00000000001c90ba	movq	$0x1, 0x1b4(%rbx)
00000000001c90c5	movw	$0x101, 0x1d8(%rbx)             ## imm = 0x101
00000000001c90ce	movb	$0x0, 0x1da(%rbx)
00000000001c90d5	movl	$0x1, 0x1c4(%rbx)
00000000001c90df	leaq	_HGRectInfinite(%rip), %rax
00000000001c90e6	movups	(%rax), %xmm0
00000000001c90e9	movups	%xmm0, 0x1c8(%rbx)
00000000001c90f0	movl	$0xffffffff, 0x1e4(%rbx)        ## imm = 0xFFFFFFFF
00000000001c90fa	movl	$0x78, %edi
00000000001c90ff	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001c9104	movq	%rax, %r14
00000000001c9107	movq	%rax, %rdi
00000000001c910a	callq	__ZN8HGObjectC2Ev               ## HGObject::HGObject()
00000000001c910f	leaq	0x860e2a(%rip), %rax
00000000001c9116	movq	%rax, (%r14)
00000000001c9119	movq	$0x0, 0x10(%r14)
00000000001c9121	xorps	%xmm0, %xmm0
00000000001c9124	movups	%xmm0, 0x40(%r14)
00000000001c9129	movq	$0x0, 0x50(%r14)
00000000001c9131	movl	$0x3f800000, 0x18(%r14)         ## imm = 0x3F800000
00000000001c9139	movups	%xmm0, 0x1c(%r14)
00000000001c913e	movups	%xmm0, 0x28(%r14)
00000000001c9143	movb	$0x1, 0x38(%r14)
00000000001c9148	movl	$0x2, 0x3c(%r14)
00000000001c9150	movaps	0x695dd9(%rip), %xmm0
00000000001c9157	movups	%xmm0, 0x58(%r14)
00000000001c915c	movb	$0x1, 0x68(%r14)
00000000001c9161	movabsq	$0x100000000, %rax              ## imm = 0x100000000
00000000001c916b	movq	%rax, 0x6c(%r14)
00000000001c916f	movq	%r14, 0x218(%rbx)
00000000001c9176	movq	%rbx, %rdi
00000000001c9179	callq	__ZN14HGColorConform21ClearConversionParamsEv ## HGColorConform::ClearConversionParams()
00000000001c917e	movq	$0x0, 0x1bc(%rbx)
00000000001c9189	movsd	0x20667f(%rip), %xmm0
00000000001c9191	movsd	%xmm0, 0x1dc(%rbx)
00000000001c9199	movaps	0x201820(%rip), %xmm0
00000000001c91a0	movups	%xmm0, 0x31c(%rbx)
00000000001c91a7	movaps	0x201f92(%rip), %xmm0
00000000001c91ae	movups	%xmm0, 0x32c(%rbx)
00000000001c91b5	movsd	0x200ef3(%rip), %xmm0
00000000001c91bd	movsd	%xmm0, 0x33c(%rbx)
00000000001c91c5	movb	$0x1, 0x344(%rbx)
00000000001c91cc	movabsq	$0x3f80000000000320, %rax       ## imm = 0x3F80000000000320
00000000001c91d6	movq	%rax, 0x348(%rbx)
00000000001c91dd	movb	$0x0, 0x350(%rbx)
00000000001c91e4	movq	$0x0, 0x1a8(%rbx)
00000000001c91ef	addq	$0x8, %rsp
00000000001c91f3	popq	%rbx
00000000001c91f4	popq	%r14
00000000001c91f6	popq	%r15
00000000001c91f8	popq	%rbp
00000000001c91f9	retq
00000000001c91fa	movq	%rax, %r15
00000000001c91fd	movq	%r14, %rdi
00000000001c9200	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001c9205	jmp	0x1c920a
00000000001c9207	movq	%rax, %r15
00000000001c920a	leaq	0x358(%rbx), %rdi
00000000001c9211	callq	__ZNSt3__110shared_ptrIN6HGPool9AllocatorIPU21objcproto10MTLTexture11objc_objectN18HGMetalTexturePool10DescriptorEEEED1B9nqe210106Ev ## std::__1::shared_ptr<HGPool::Allocator<id<MTLTexture>, HGMetalTexturePool::Descriptor>>::~shared_ptr[abi:nqe210106]()
00000000001c9216	movq	%rbx, %rdi
00000000001c9219	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000001c921e	movq	%r15, %rdi
00000000001c9221	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001c9226	nopw	%cs:(%rax,%rax)

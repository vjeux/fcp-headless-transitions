__ZN6HGCropC2Ev:
0000000000247990	pushq	%rbp
0000000000247991	movq	%rsp, %rbp
0000000000247994	pushq	%r15
0000000000247996	pushq	%r14
0000000000247998	pushq	%rbx
0000000000247999	pushq	%rax
000000000024799a	movq	%rdi, %rbx
000000000024799d	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
00000000002479a2	leaq	0x7ef12f(%rip), %rax
00000000002479a9	movq	%rax, (%rbx)
00000000002479ac	movq	$0x0, 0x198(%rbx)
00000000002479b7	movl	$0x1b0, %edi                    ## imm = 0x1B0
00000000002479bc	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000002479c1	movq	%rax, %r14
00000000002479c4	movq	%rax, %rdi
00000000002479c7	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
00000000002479cc	leaq	0x7eeec5(%rip), %rax
00000000002479d3	movq	%rax, (%r14)
00000000002479d6	movl	$0x20, %edi
00000000002479db	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000002479e0	xorps	%xmm0, %xmm0
00000000002479e3	movaps	%xmm0, 0x10(%rax)
00000000002479e7	movaps	%xmm0, (%rax)
00000000002479ea	movq	%rax, 0x198(%r14)
00000000002479f1	movl	$0xfffff9ff, %eax               ## imm = 0xFFFFF9FF
00000000002479f6	andl	0x10(%r14), %eax
00000000002479fa	orl	$0x400, %eax                    ## imm = 0x400
00000000002479ff	leaq	0x7ef342(%rip), %rcx
0000000000247a06	movq	%rcx, (%r14)
0000000000247a09	leaq	_HGRectInfinite(%rip), %rcx
0000000000247a10	movups	(%rcx), %xmm0
0000000000247a13	movups	%xmm0, 0x1a0(%r14)
0000000000247a1b	movl	$0x632c058b, 0xc(%r14)          ## imm = 0x632C058B
0000000000247a23	movl	%eax, 0x10(%r14)
0000000000247a27	movq	0x198(%rbx), %rdi
0000000000247a2e	cmpq	%r14, %rdi
0000000000247a31	je	0x247a47
0000000000247a33	testq	%rdi, %rdi
0000000000247a36	je	0x247a3e
0000000000247a38	movq	(%rdi), %rax
0000000000247a3b	callq	*0x18(%rax)
0000000000247a3e	movq	%r14, 0x198(%rbx)
0000000000247a45	jmp	0x247a56
0000000000247a47	movq	%r14, %rdi
0000000000247a4a	callq	__ZN8HGObject7ReleaseEv         ## HGObject::Release()
0000000000247a4f	movq	0x198(%rbx), %r14
0000000000247a56	movl	0xc(%r14), %eax
0000000000247a5a	movl	%eax, 0xc(%rbx)
0000000000247a5d	movl	$0xfffff9ff, %eax               ## imm = 0xFFFFF9FF
0000000000247a62	andl	0x10(%rbx), %eax
0000000000247a65	orl	$0x400, %eax                    ## imm = 0x400
0000000000247a6a	movl	%eax, 0x10(%rbx)
0000000000247a6d	addq	$0x8, %rsp
0000000000247a71	popq	%rbx
0000000000247a72	popq	%r14
0000000000247a74	popq	%r15
0000000000247a76	popq	%rbp
0000000000247a77	retq
0000000000247a78	movq	%rax, %rdi
0000000000247a7b	callq	___clang_call_terminate
0000000000247a80	movq	%rax, %r15
0000000000247a83	movq	(%r14), %rax
0000000000247a86	movq	%r14, %rdi
0000000000247a89	callq	*0x18(%rax)
0000000000247a8c	jmp	0x247ab3
0000000000247a8e	movq	%rax, %rdi
0000000000247a91	callq	___clang_call_terminate
0000000000247a96	movq	%rax, %r15
0000000000247a99	movq	%r14, %rdi
0000000000247a9c	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000247aa1	jmp	0x247aa6
0000000000247aa3	movq	%rax, %r15
0000000000247aa6	movq	%r14, %rdi
0000000000247aa9	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000247aae	jmp	0x247ab3
0000000000247ab0	movq	%rax, %r15
0000000000247ab3	movq	0x198(%rbx), %rdi
0000000000247aba	testq	%rdi, %rdi
0000000000247abd	je	0x247ac5
0000000000247abf	movq	(%rdi), %rax
0000000000247ac2	callq	*0x18(%rax)
0000000000247ac5	movq	%rbx, %rdi
0000000000247ac8	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000247acd	movq	%r15, %rdi
0000000000247ad0	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000247ad5	movq	%rax, %rdi
0000000000247ad8	callq	___clang_call_terminate
0000000000247add	nopl	(%rax)
__ZN6HGCropC1Ev:
0000000000247ae0	pushq	%rbp
0000000000247ae1	movq	%rsp, %rbp
0000000000247ae4	popq	%rbp
0000000000247ae5	jmp	__ZN6HGCropC2Ev                 ## HGCrop::HGCrop()
0000000000247aea	nopw	(%rax,%rax)
__ZN6HGCrop9GetOutputEP10HGRenderer:
0000000000247af0	pushq	%rbp
0000000000247af1	movq	%rsp, %rbp
0000000000247af4	pushq	%r14
0000000000247af6	pushq	%rbx
0000000000247af7	movq	%rdi, %rbx
0000000000247afa	movq	0x198(%rdi), %r14
0000000000247b01	movq	%rsi, %rdi
0000000000247b04	movq	%rbx, %rsi
0000000000247b07	xorl	%edx, %edx
0000000000247b09	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
0000000000247b0e	movq	(%r14), %rcx
0000000000247b11	movq	%r14, %rdi
0000000000247b14	xorl	%esi, %esi
0000000000247b16	movq	%rax, %rdx
0000000000247b19	callq	*0x78(%rcx)
0000000000247b1c	movq	(%rbx), %rax
0000000000247b1f	movq	0x198(%rbx), %r14
0000000000247b26	movq	%rbx, %rdi
0000000000247b29	xorl	%esi, %esi
0000000000247b2b	callq	*0x98(%rax)
0000000000247b31	movq	(%r14), %rcx
0000000000247b34	movq	%r14, %rdi
0000000000247b37	xorl	%esi, %esi
0000000000247b39	movl	%eax, %edx
0000000000247b3b	callq	*0x88(%rcx)
0000000000247b41	movq	(%rbx), %rax
0000000000247b44	movq	0x198(%rbx), %r14
0000000000247b4b	movq	%rbx, %rdi
0000000000247b4e	movl	$0xffffffff, %esi               ## imm = 0xFFFFFFFF
0000000000247b53	callq	*0x98(%rax)
0000000000247b59	movq	(%r14), %rcx
0000000000247b5c	movq	%r14, %rdi
0000000000247b5f	movl	$0xffffffff, %esi               ## imm = 0xFFFFFFFF
0000000000247b64	movl	%eax, %edx
0000000000247b66	callq	*0x88(%rcx)
0000000000247b6c	movq	0x198(%rbx), %rax
0000000000247b73	popq	%rbx
0000000000247b74	popq	%r14
0000000000247b76	popq	%rbp
0000000000247b77	retq
0000000000247b78	nopl	(%rax,%rax)
__ZN6HGCrop12SetParameterEiffff:
0000000000247b80	pushq	%rbp
0000000000247b81	movq	%rsp, %rbp
0000000000247b84	movq	0x198(%rdi), %rdi
0000000000247b8b	movq	(%rdi), %rax
0000000000247b8e	movq	0x60(%rax), %rax
0000000000247b92	popq	%rbp
0000000000247b93	jmpq	*%rax
0000000000247b95	nopw	%cs:(%rax,%rax)
__ZN6HGCropD1Ev:
0000000000247ba0	pushq	%rbp
0000000000247ba1	movq	%rsp, %rbp
0000000000247ba4	pushq	%rbx
0000000000247ba5	pushq	%rax
0000000000247ba6	leaq	0x7eef2b(%rip), %rax
0000000000247bad	movq	%rax, (%rdi)
0000000000247bb0	movq	0x198(%rdi), %rax
0000000000247bb7	testq	%rax, %rax
0000000000247bba	je	0x247bcb
0000000000247bbc	movq	(%rax), %rcx
0000000000247bbf	movq	%rdi, %rbx
0000000000247bc2	movq	%rax, %rdi
0000000000247bc5	callq	*0x18(%rcx)
0000000000247bc8	movq	%rbx, %rdi
0000000000247bcb	addq	$0x8, %rsp
0000000000247bcf	popq	%rbx
0000000000247bd0	popq	%rbp
0000000000247bd1	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000247bd6	movq	%rax, %rdi
0000000000247bd9	callq	___clang_call_terminate
0000000000247bde	nop
__ZN6HGCropD0Ev:
0000000000247be0	pushq	%rbp
0000000000247be1	movq	%rsp, %rbp
0000000000247be4	pushq	%rbx
0000000000247be5	pushq	%rax
0000000000247be6	movq	%rdi, %rbx
0000000000247be9	leaq	0x7eeee8(%rip), %rax
0000000000247bf0	movq	%rax, (%rdi)
0000000000247bf3	movq	0x198(%rdi), %rdi
0000000000247bfa	testq	%rdi, %rdi
0000000000247bfd	je	0x247c05
0000000000247bff	movq	(%rdi), %rax
0000000000247c02	callq	*0x18(%rax)
0000000000247c05	movq	%rbx, %rdi
0000000000247c08	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000247c0d	movq	%rbx, %rdi
0000000000247c10	addq	$0x8, %rsp
0000000000247c14	popq	%rbx
0000000000247c15	popq	%rbp
0000000000247c16	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000247c1b	movq	%rax, %rdi
0000000000247c1e	callq	___clang_call_terminate
0000000000247c23	nopw	%cs:(%rax,%rax)
__ZN10HGCropNodeD1Ev:
0000000000247c30	leaq	0x7eec61(%rip), %rax
0000000000247c37	movq	%rax, (%rdi)

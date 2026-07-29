__ZN14HGColorConform13SetConversionEPK16ColorSyncProfileS2_:
00000000001ca040	pushq	%rbp
00000000001ca041	movq	%rsp, %rbp
00000000001ca044	pushq	%r15
00000000001ca046	pushq	%r14
00000000001ca048	pushq	%r12
00000000001ca04a	pushq	%rbx
00000000001ca04b	subq	$0x40, %rsp
00000000001ca04f	movq	%rdx, %r14
00000000001ca052	movq	%rsi, %r15
00000000001ca055	movq	%rdi, %rbx
00000000001ca058	movq	0x8381f9(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
00000000001ca05f	movq	(%rax), %rax
00000000001ca062	movq	%rax, -0x28(%rbp)
00000000001ca066	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000001ca06b	movl	$0xffffffff, 0x1e4(%rbx)        ## imm = 0xFFFFFFFF
00000000001ca075	movq	%rbx, %rdi
00000000001ca078	callq	__ZN14HGColorConform21ClearConversionParamsEv ## HGColorConform::ClearConversionParams()
00000000001ca07d	movq	__ZN14HGColorConform19s_NodeListCacheLockE(%rip), %r12 ## HGColorConform::s_NodeListCacheLock
00000000001ca084	movq	%r12, -0x38(%rbp)
00000000001ca088	movb	$0x0, -0x30(%rbp)
00000000001ca08c	movq	%r12, %rdi
00000000001ca08f	callq	__ZN16HGSynchronizable4LockEv   ## HGSynchronizable::Lock()
00000000001ca094	movq	0x1a8(%rbx), %rdi
00000000001ca09b	testq	%rdi, %rdi
00000000001ca09e	je	0x1ca0a6
00000000001ca0a0	movq	(%rdi), %rax
00000000001ca0a3	callq	*0x18(%rax)
00000000001ca0a6	movq	%r12, %rdi
00000000001ca0a9	callq	__ZN16HGSynchronizable6UnlockEv ## HGSynchronizable::Unlock()
00000000001ca0ae	movq	%r15, %rdi
00000000001ca0b1	callq	0x3c4d9c                        ## symbol stub for: _ColorSyncProfileGetMD5
00000000001ca0b6	movq	%rax, -0x38(%rbp)
00000000001ca0ba	movq	%rdx, -0x30(%rbp)
00000000001ca0be	movq	%r14, %rdi
00000000001ca0c1	callq	0x3c4d9c                        ## symbol stub for: _ColorSyncProfileGetMD5
00000000001ca0c6	movq	%rax, -0x48(%rbp)
00000000001ca0ca	movq	%rdx, -0x40(%rbp)
00000000001ca0ce	movdqu	-0x38(%rbp), %xmm0
00000000001ca0d3	movdqu	-0x48(%rbp), %xmm1
00000000001ca0d8	pxor	%xmm0, %xmm1
00000000001ca0dc	ptest	%xmm1, %xmm1
00000000001ca0e1	je	0x1ca139
00000000001ca0e3	addq	$0x1a8, %rbx                    ## imm = 0x1A8
00000000001ca0ea	movq	__ZN14HGColorConform19s_NodeListCacheLockE(%rip), %r12 ## HGColorConform::s_NodeListCacheLock
00000000001ca0f1	movq	%r12, -0x58(%rbp)
00000000001ca0f5	movb	$0x0, -0x50(%rbp)
00000000001ca0f9	movq	%r12, %rdi
00000000001ca0fc	callq	__ZN16HGSynchronizable4LockEv   ## HGSynchronizable::Lock()
00000000001ca101	movq	%r15, %rdi
00000000001ca104	movq	%r14, %rsi
00000000001ca107	movq	%rbx, %rdx
00000000001ca10a	xorl	%ecx, %ecx
00000000001ca10c	callq	__ZN14HGColorConform18DecodeFragmentListEPK16ColorSyncProfileS2_PP31HGColorConformNodeListCacheItemb ## HGColorConform::DecodeFragmentList(ColorSyncProfile const*, ColorSyncProfile const*, HGColorConformNodeListCacheItem**, bool)
00000000001ca111	testb	%al, %al
00000000001ca113	jne	0x1ca12c
00000000001ca115	movq	%r15, %rdi
00000000001ca118	movq	%r14, %rsi
00000000001ca11b	movq	%rbx, %rdx
00000000001ca11e	movl	$0x1, %ecx
00000000001ca123	callq	__ZN14HGColorConform18DecodeFragmentListEPK16ColorSyncProfileS2_PP31HGColorConformNodeListCacheItemb ## HGColorConform::DecodeFragmentList(ColorSyncProfile const*, ColorSyncProfile const*, HGColorConformNodeListCacheItem**, bool)
00000000001ca128	testb	%al, %al
00000000001ca12a	je	0x1ca13d
00000000001ca12c	movq	(%rbx), %rdi
00000000001ca12f	movq	(%rdi), %rax
00000000001ca132	movb	$0x1, %bl
00000000001ca134	callq	*0x10(%rax)
00000000001ca137	jmp	0x1ca146
00000000001ca139	movb	$0x1, %bl
00000000001ca13b	jmp	0x1ca14e
00000000001ca13d	movq	$0x0, (%rbx)
00000000001ca144	xorl	%ebx, %ebx
00000000001ca146	movq	%r12, %rdi
00000000001ca149	callq	__ZN16HGSynchronizable6UnlockEv ## HGSynchronizable::Unlock()
00000000001ca14e	movq	0x838103(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
00000000001ca155	movq	(%rax), %rax
00000000001ca158	cmpq	-0x28(%rbp), %rax
00000000001ca15c	jne	0x1ca16d
00000000001ca15e	movl	%ebx, %eax
00000000001ca160	addq	$0x40, %rsp
00000000001ca164	popq	%rbx
00000000001ca165	popq	%r12
00000000001ca167	popq	%r14
00000000001ca169	popq	%r15
00000000001ca16b	popq	%rbp
00000000001ca16c	retq
00000000001ca16d	callq	0x3c5030                        ## symbol stub for: ___stack_chk_fail
00000000001ca172	jmp	0x1ca17d
00000000001ca174	movq	%rax, %rbx
00000000001ca177	leaq	-0x38(%rbp), %rdi
00000000001ca17b	jmp	0x1ca193
00000000001ca17d	movq	%rax, %rbx
00000000001ca180	testl	%edx, %edx
00000000001ca182	je	0x1ca198
00000000001ca184	movq	%rbx, %rdi
00000000001ca187	callq	___clang_call_terminate
00000000001ca18c	movq	%rax, %rbx
00000000001ca18f	leaq	-0x58(%rbp), %rdi
00000000001ca193	callq	__ZN14HGSynchronizerD1Ev        ## HGSynchronizer::~HGSynchronizer()
00000000001ca198	movq	%rbx, %rdi
00000000001ca19b	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume

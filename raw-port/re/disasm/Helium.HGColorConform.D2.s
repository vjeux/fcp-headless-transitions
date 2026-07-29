__ZN14HGColorConformD2Ev:
00000000001c9420	pushq	%rbp
00000000001c9421	movq	%rsp, %rbp
00000000001c9424	pushq	%r14
00000000001c9426	pushq	%rbx
00000000001c9427	movq	%rdi, %rbx
00000000001c942a	leaq	0x86086f(%rip), %rax
00000000001c9431	movq	%rax, (%rdi)
00000000001c9434	movq	0x1a0(%rdi), %rdi
00000000001c943b	testq	%rdi, %rdi
00000000001c943e	je	0x1c9446
00000000001c9440	movq	(%rdi), %rax
00000000001c9443	callq	*0x18(%rax)
00000000001c9446	movq	0x218(%rbx), %rdi
00000000001c944d	testq	%rdi, %rdi
00000000001c9450	je	0x1c9458
00000000001c9452	movq	(%rdi), %rax
00000000001c9455	callq	*0x18(%rax)
00000000001c9458	movq	__ZN14HGColorConform19s_NodeListCacheLockE(%rip), %r14 ## HGColorConform::s_NodeListCacheLock
00000000001c945f	movq	%r14, %rdi
00000000001c9462	callq	__ZN16HGSynchronizable4LockEv   ## HGSynchronizable::Lock()
00000000001c9467	movq	0x1a8(%rbx), %rdi
00000000001c946e	testq	%rdi, %rdi
00000000001c9471	je	0x1c9479
00000000001c9473	movq	(%rdi), %rax
00000000001c9476	callq	*0x18(%rax)
00000000001c9479	movq	%r14, %rdi
00000000001c947c	callq	__ZN16HGSynchronizable6UnlockEv ## HGSynchronizable::Unlock()
00000000001c9481	movq	0x360(%rbx), %r14
00000000001c9488	testq	%r14, %r14
00000000001c948b	je	0x1c94b0
00000000001c948d	movq	$-0x1, %rax
00000000001c9494	lock
00000000001c9495	xaddq	%rax, 0x8(%r14)
00000000001c949a	testq	%rax, %rax
00000000001c949d	jne	0x1c94b0
00000000001c949f	movq	(%r14), %rax
00000000001c94a2	movq	%r14, %rdi
00000000001c94a5	callq	*0x10(%rax)
00000000001c94a8	movq	%r14, %rdi
00000000001c94ab	callq	0x3c4efe                        ## symbol stub for: __ZNSt3__119__shared_weak_count14__release_weakEv
00000000001c94b0	movq	%rbx, %rdi
00000000001c94b3	popq	%rbx
00000000001c94b4	popq	%r14
00000000001c94b6	popq	%rbp
00000000001c94b7	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000001c94bc	movq	%rax, %rdi
00000000001c94bf	callq	___clang_call_terminate
00000000001c94c4	movq	%rax, %rdi
00000000001c94c7	callq	___clang_call_terminate
00000000001c94cc	nopl	(%rax)

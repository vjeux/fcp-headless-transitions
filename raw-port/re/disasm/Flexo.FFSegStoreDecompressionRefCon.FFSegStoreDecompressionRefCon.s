__ZN29FFSegStoreDecompressionRefConC1El:
000000000126ec70	pushq	%rbp
000000000126ec71	movq	%rsp, %rbp
000000000126ec74	pushq	%r14
000000000126ec76	pushq	%rbx
000000000126ec77	movq	%rsi, %r14
000000000126ec7a	movq	%rdi, %rbx
000000000126ec7d	xorl	%esi, %esi
000000000126ec7f	xorl	%edx, %edx
000000000126ec81	callq	__ZN16FFSynchronizableC1EPFvbPKvES1_ ## FFSynchronizable::FFSynchronizable(void (*)(bool, void const*), void const*)
000000000126ec86	movb	$0x0, 0x90(%rbx)
000000000126ec8d	movl	$0x0, 0x94(%rbx)
000000000126ec97	movq	$0x0, 0x98(%rbx)
000000000126eca2	movq	%r14, 0xa0(%rbx)
000000000126eca9	movq	%rbx, %rdi
000000000126ecac	callq	__ZN16FFSynchronizable4LockEv   ## FFSynchronizable::Lock()
000000000126ecb1	movq	%rbx, %rdi
000000000126ecb4	callq	__ZN16FFSynchronizable6UnlockEv ## FFSynchronizable::Unlock()
000000000126ecb9	popq	%rbx
000000000126ecba	popq	%r14
000000000126ecbc	popq	%rbp
000000000126ecbd	retq
000000000126ecbe	movq	%rax, %rdi
000000000126ecc1	callq	___clang_call_terminate
000000000126ecc6	movq	%rax, %r14
000000000126ecc9	movq	%rbx, %rdi
000000000126eccc	callq	__ZN16FFSynchronizableD1Ev      ## FFSynchronizable::~FFSynchronizable()
000000000126ecd1	movq	%r14, %rdi
000000000126ecd4	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
000000000126ecd9	nopl	(%rax)

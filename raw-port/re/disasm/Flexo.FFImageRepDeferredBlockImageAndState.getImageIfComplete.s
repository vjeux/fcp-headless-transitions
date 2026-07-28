__ZN36FFImageRepDeferredBlockImageAndState18getImageIfCompleteEv:
00000000007490e0	pushq	%rbp
00000000007490e1	movq	%rsp, %rbp
00000000007490e4	pushq	%r15
00000000007490e6	pushq	%r14
00000000007490e8	pushq	%rbx
00000000007490e9	subq	$0x18, %rsp
00000000007490ed	movq	%rsi, %r14
00000000007490f0	movq	%rdi, %rbx
00000000007490f3	movq	$0x0, (%rdi)
00000000007490fa	movq	%rsi, -0x28(%rbp)
00000000007490fe	movb	$0x0, -0x20(%rbp)
0000000000749102	movq	%rsi, %rdi
0000000000749105	callq	__ZN16FFSynchronizable4LockEv   ## FFSynchronizable::Lock()
000000000074910a	movq	%r14, %rdi
000000000074910d	callq	__ZN16FFSynchronizable4LockEv   ## FFSynchronizable::Lock()
0000000000749112	movl	0x90(%r14), %r15d
0000000000749119	movq	%r14, %rdi
000000000074911c	callq	__ZN16FFSynchronizable6UnlockEv ## FFSynchronizable::Unlock()
0000000000749121	cmpl	$0x2, %r15d
0000000000749125	jne	0x749136
0000000000749127	leaq	0x98(%r14), %rsi
000000000074912e	movq	%rbx, %rdi
0000000000749131	callq	0x1496120                       ## symbol stub for: __ZN12ProCore_Impl11PCNSRefImplaSERKS0_
0000000000749136	movq	%r14, %rdi
0000000000749139	callq	__ZN16FFSynchronizable6UnlockEv ## FFSynchronizable::Unlock()
000000000074913e	movq	%rbx, %rax
0000000000749141	addq	$0x18, %rsp
0000000000749145	popq	%rbx
0000000000749146	popq	%r14
0000000000749148	popq	%r15
000000000074914a	popq	%rbp
000000000074914b	retq
000000000074914c	movq	%rax, %rdi
000000000074914f	callq	___clang_call_terminate
0000000000749154	movq	%rax, %rdi
0000000000749157	callq	___clang_call_terminate
000000000074915c	movq	%rax, %r14
000000000074915f	jmp	0x74916d
0000000000749161	movq	%rax, %r14
0000000000749164	leaq	-0x28(%rbp), %rdi
0000000000749168	callq	__ZN14FFSynchronizerD1Ev        ## FFSynchronizer::~FFSynchronizer()
000000000074916d	movq	%rbx, %rdi
0000000000749170	callq	0x1496f96                       ## symbol stub for: __ZNK12ProCore_Impl11PCNSRefImpl7releaseEv
0000000000749175	movq	%r14, %rdi
0000000000749178	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
000000000074917d	movq	%rax, %rdi
0000000000749180	callq	___clang_call_terminate
0000000000749185	nopw	%cs:(%rax,%rax)

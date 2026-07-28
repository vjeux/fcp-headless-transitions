__ZN36FFImageRepDeferredBlockImageAndState19performWorkIfNeededEPK11FxDeviceSetU13block_pointerF7PCNSRefIP7FFImageEvE:
0000000000749200	pushq	%rbp
0000000000749201	movq	%rsp, %rbp
0000000000749204	pushq	%r15
0000000000749206	pushq	%r14
0000000000749208	pushq	%r13
000000000074920a	pushq	%r12
000000000074920c	pushq	%rbx
000000000074920d	subq	$0x38, %rsp
0000000000749211	movq	%rcx, %r12
0000000000749214	movq	%rdx, -0x60(%rbp)
0000000000749218	movq	%rsi, %r14
000000000074921b	movq	%rdi, %rbx
000000000074921e	movq	$0x0, (%rdi)
0000000000749225	movq	%rsi, -0x48(%rbp)
0000000000749229	movb	$0x0, -0x40(%rbp)
000000000074922d	movq	%rsi, %rdi
0000000000749230	callq	__ZN16FFSynchronizable4LockEv   ## FFSynchronizable::Lock()
0000000000749235	movl	0x90(%r14), %r15d
000000000074923c	testl	%r15d, %r15d
000000000074923f	je	0x7492a3
0000000000749241	cmpl	$0x1, %r15d
0000000000749245	jg	0x7492e5
000000000074924b	leaq	0xb0(%r14), %rdi
0000000000749252	leaq	0xee1254(%rip), %rdx            ## literal pool for: "boost thread doing FFImageRepDeferredBlock execution"
0000000000749259	movl	$0x1, %esi
000000000074925e	callq	_FFCreateThreadPriorityOverride
0000000000749263	movq	%rax, %r13
0000000000749266	movq	0x11a62d3(%rip), %rdi           ## literal pool symbol address: _OBJC_CLASS_$_NSDate
000000000074926d	movq	0x1472f84(%rip), %rsi
0000000000749274	callq	*0x11a4446(%rip)                ## Objc message: -[%rdi requestedSizeForAssetSize:scaleDownFactor:codec:outProxySizeAdjustedForCodec:]
000000000074927a	movq	%r14, %rdi
000000000074927d	movl	$0x2, %esi
0000000000749282	movq	%rax, %rdx
0000000000749285	callq	__ZN36FFImageRepDeferredBlockImageAndState23waitForStateWithTimeoutENS_23DeferredBlockImageStateEP6NSDate ## FFImageRepDeferredBlockImageAndState::waitForStateWithTimeout(FFImageRepDeferredBlockImageAndState::DeferredBlockImageState, NSDate*)
000000000074928a	leaq	0x98(%r14), %rsi
0000000000749291	movq	%rbx, %rdi
0000000000749294	callq	0x1496120                       ## symbol stub for: __ZN12ProCore_Impl11PCNSRefImplaSERKS0_
0000000000749299	movq	%r13, %rdi
000000000074929c	callq	_FFReleaseThreadPriorityOverrideGroup
00000000007492a1	jmp	0x7492e5
00000000007492a3	movq	%r14, -0x38(%rbp)
00000000007492a7	movb	$0x0, -0x30(%rbp)
00000000007492ab	movq	%r14, %rdi
00000000007492ae	callq	__ZN16FFSynchronizable4LockEv   ## FFSynchronizable::Lock()
00000000007492b3	cmpl	$0x1, 0x90(%r14)
00000000007492bb	je	0x7492d1
00000000007492bd	movl	$0x1, 0x90(%r14)
00000000007492c8	leaq	0x40(%r14), %rdi
00000000007492cc	callq	0x1497a70                       ## symbol stub for: _pthread_cond_broadcast
00000000007492d1	movq	%r14, %rdi
00000000007492d4	callq	__ZN16FFSynchronizable6UnlockEv ## FFSynchronizable::Unlock()
00000000007492d9	callq	_FFThreadCurrent
00000000007492de	movq	%rax, 0xb0(%r14)
00000000007492e5	movq	%r14, %rdi
00000000007492e8	callq	__ZN16FFSynchronizable6UnlockEv ## FFSynchronizable::Unlock()
00000000007492ed	testl	%r15d, %r15d
00000000007492f0	jne	0x7493b9
00000000007492f6	callq	_FFGetHostTimeSeconds
00000000007492fb	movsd	%xmm0, -0x58(%rbp)
0000000000749300	leaq	-0x38(%rbp), %rdi
0000000000749304	movq	%r12, %rsi
0000000000749307	callq	*0x10(%r12)
000000000074930c	leaq	-0x38(%rbp), %rsi
0000000000749310	movq	%rbx, %rdi
0000000000749313	callq	0x149611a                       ## symbol stub for: __ZN12ProCore_Impl11PCNSRefImplaSEOS0_
0000000000749318	leaq	-0x38(%rbp), %rdi
000000000074931c	callq	0x1496f96                       ## symbol stub for: __ZNK12ProCore_Impl11PCNSRefImpl7releaseEv
0000000000749321	callq	_FFGetHostTimeSeconds
0000000000749326	movsd	%xmm0, -0x50(%rbp)
000000000074932b	movq	%r14, -0x48(%rbp)
000000000074932f	movb	$0x0, -0x40(%rbp)
0000000000749333	movq	%r14, %rdi
0000000000749336	callq	__ZN16FFSynchronizable4LockEv   ## FFSynchronizable::Lock()
000000000074933b	leaq	0x98(%r14), %rdi
0000000000749342	movq	%rbx, %rsi
0000000000749345	callq	0x1496120                       ## symbol stub for: __ZN12ProCore_Impl11PCNSRefImplaSERKS0_
000000000074934a	movsd	-0x50(%rbp), %xmm0
000000000074934f	subsd	-0x58(%rbp), %xmm0
0000000000749354	mulsd	0xe23764(%rip), %xmm0
000000000074935c	movsd	%xmm0, 0xa0(%r14)
0000000000749365	movq	-0x60(%rbp), %rax
0000000000749369	movq	%rax, 0xa8(%r14)
0000000000749370	movq	%r14, -0x38(%rbp)
0000000000749374	movb	$0x0, -0x30(%rbp)
0000000000749378	movq	%r14, %rdi
000000000074937b	callq	__ZN16FFSynchronizable4LockEv   ## FFSynchronizable::Lock()
0000000000749380	cmpl	$0x2, 0x90(%r14)
0000000000749388	je	0x74939e
000000000074938a	movl	$0x2, 0x90(%r14)
0000000000749395	leaq	0x40(%r14), %rdi
0000000000749399	callq	0x1497a70                       ## symbol stub for: _pthread_cond_broadcast
000000000074939e	movq	%r14, %rdi
00000000007493a1	callq	__ZN16FFSynchronizable6UnlockEv ## FFSynchronizable::Unlock()
00000000007493a6	movq	$0x0, 0xb0(%r14)
00000000007493b1	movq	%r14, %rdi
00000000007493b4	callq	__ZN16FFSynchronizable6UnlockEv ## FFSynchronizable::Unlock()
00000000007493b9	movq	%rbx, %rax
00000000007493bc	addq	$0x38, %rsp
00000000007493c0	popq	%rbx
00000000007493c1	popq	%r12
00000000007493c3	popq	%r13
00000000007493c5	popq	%r14
00000000007493c7	popq	%r15
00000000007493c9	popq	%rbp
00000000007493ca	retq
00000000007493cb	jmp	0x7493cd
00000000007493cd	movq	%rax, %r14
00000000007493d0	leaq	-0x38(%rbp), %rdi
00000000007493d4	callq	__ZN14FFSynchronizerD1Ev        ## FFSynchronizer::~FFSynchronizer()
00000000007493d9	jmp	0x749439
00000000007493db	movq	%rax, %rdi
00000000007493de	callq	___clang_call_terminate
00000000007493e3	movq	%rax, %rdi
00000000007493e6	callq	___clang_call_terminate
00000000007493eb	movq	%rax, %r14
00000000007493ee	jmp	0x749442
00000000007493f0	movq	%rax, %r14
00000000007493f3	jmp	0x749442
00000000007493f5	movq	%rax, %rdi
00000000007493f8	callq	___clang_call_terminate
00000000007493fd	movq	%rax, %r14
0000000000749400	leaq	-0x38(%rbp), %rdi
0000000000749404	callq	0x1496f96                       ## symbol stub for: __ZNK12ProCore_Impl11PCNSRefImpl7releaseEv
0000000000749409	jmp	0x749442
000000000074940b	movq	%rax, %rdi
000000000074940e	callq	___clang_call_terminate
0000000000749413	movq	%rax, %r14
0000000000749416	jmp	0x749442
0000000000749418	movq	%rax, %r14
000000000074941b	jmp	0x749442
000000000074941d	movq	%rax, %rdi
0000000000749420	callq	___clang_call_terminate
0000000000749425	jmp	0x749436
0000000000749427	jmp	0x749436
0000000000749429	movq	%rax, %rdi
000000000074942c	callq	___clang_call_terminate
0000000000749431	movq	%rax, %r14
0000000000749434	jmp	0x749442
0000000000749436	movq	%rax, %r14
0000000000749439	leaq	-0x48(%rbp), %rdi
000000000074943d	callq	__ZN14FFSynchronizerD1Ev        ## FFSynchronizer::~FFSynchronizer()
0000000000749442	movq	%rbx, %rdi
0000000000749445	callq	0x1496f96                       ## symbol stub for: __ZNK12ProCore_Impl11PCNSRefImpl7releaseEv
000000000074944a	movq	%r14, %rdi
000000000074944d	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000000749452	movq	%rax, %rdi
0000000000749455	callq	___clang_call_terminate
000000000074945a	nopw	(%rax,%rax)

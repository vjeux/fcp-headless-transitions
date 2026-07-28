__ZN36FFImageRepDeferredBlockImageAndState23waitForStateWithTimeoutENS_23DeferredBlockImageStateEP6NSDate:
0000000000749460	pushq	%rbp
0000000000749461	movq	%rsp, %rbp
0000000000749464	pushq	%r15
0000000000749466	pushq	%r14
0000000000749468	pushq	%r13
000000000074946a	pushq	%r12
000000000074946c	pushq	%rbx
000000000074946d	subq	$0x18, %rsp
0000000000749471	movq	%rdx, %r14
0000000000749474	movl	%esi, %ebx
0000000000749476	movq	%rdi, %r15
0000000000749479	movq	%rdi, -0x38(%rbp)
000000000074947d	movb	$0x0, -0x30(%rbp)
0000000000749481	callq	__ZN16FFSynchronizable4LockEv   ## FFSynchronizable::Lock()
0000000000749486	movq	0x146fd2b(%rip), %rsi
000000000074948d	movq	%r14, %rdi
0000000000749490	callq	*0x11a422a(%rip)                ## Objc message: -[%rdi requestedSizeForAssetSize:scaleDownFactor:codec:outProxySizeAdjustedForCodec:]
0000000000749496	mulsd	0xe23622(%rip), %xmm0
000000000074949e	movq	0x11a421b(%rip), %r13           ## Objc message: -[%rdi requestedSizeForAssetSize:scaleDownFactor:codec:outProxySizeAdjustedForCodec:]
00000000007494a5	nopw	%cs:(%rax,%rax)
00000000007494b0	cmpl	%ebx, 0x90(%r15)
00000000007494b7	setge	%r12b
00000000007494bb	jge	0x74951f
00000000007494bd	xorpd	%xmm1, %xmm1
00000000007494c1	ucomisd	%xmm0, %xmm1
00000000007494c5	jae	0x74951f
00000000007494c7	minsd	0xe235f1(%rip), %xmm0
00000000007494cf	cvttsd2si	%xmm0, %rsi
00000000007494d4	movq	%rsi, %rax
00000000007494d7	sarq	$0x3f, %rax
00000000007494db	subsd	0xe235e5(%rip), %xmm0
00000000007494e3	cvttsd2si	%xmm0, %rcx
00000000007494e8	andl	%eax, %ecx
00000000007494ea	orl	%ecx, %esi
00000000007494ec	leaq	-0x38(%rbp), %rdi
00000000007494f0	callq	__ZN14FFSynchronizer7WaitForEj  ## FFSynchronizer::WaitFor(unsigned int)
00000000007494f5	movq	%r14, %rdi
00000000007494f8	movq	0x146fcb9(%rip), %rsi
00000000007494ff	callq	*%r13
0000000000749502	mulsd	0xe235b6(%rip), %xmm0
000000000074950a	xorpd	%xmm1, %xmm1
000000000074950e	ucomisd	%xmm1, %xmm0
0000000000749512	ja	0x7494b0
0000000000749514	cmpl	%ebx, 0x90(%r15)
000000000074951b	setge	%r12b
000000000074951f	cmpb	$0x0, -0x30(%rbp)
0000000000749523	jne	0x74952e
0000000000749525	movq	-0x38(%rbp), %rdi
0000000000749529	callq	__ZN16FFSynchronizable6UnlockEv ## FFSynchronizable::Unlock()
000000000074952e	movl	%r12d, %eax
0000000000749531	addq	$0x18, %rsp
0000000000749535	popq	%rbx
0000000000749536	popq	%r12
0000000000749538	popq	%r13
000000000074953a	popq	%r14
000000000074953c	popq	%r15
000000000074953e	popq	%rbp
000000000074953f	retq
0000000000749540	movq	%rax, %rdi
0000000000749543	callq	___clang_call_terminate
0000000000749548	jmp	0x74954c
000000000074954a	jmp	0x74954c
000000000074954c	movq	%rax, %rbx
000000000074954f	leaq	-0x38(%rbp), %rdi
0000000000749553	callq	__ZN14FFSynchronizerD1Ev        ## FFSynchronizer::~FFSynchronizer()
0000000000749558	movq	%rbx, %rdi
000000000074955b	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume

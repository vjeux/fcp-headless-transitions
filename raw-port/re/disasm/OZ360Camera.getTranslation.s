__ZNK11OZ360Camera14getTranslationEP9PCVector3IdE:
0000000000448560	pushq	%rbp
0000000000448561	movq	%rsp, %rbp
0000000000448564	pushq	%r15
0000000000448566	pushq	%r14
0000000000448568	pushq	%rbx
0000000000448569	subq	$0x58, %rsp
000000000044856d	movq	%rsi, %rbx
0000000000448570	movq	%rdi, %r14
0000000000448573	movq	0x208(%rdi), %rsi
000000000044857a	leaq	-0x68(%rbp), %rdi
000000000044857e	callq	__ZNK7OZScene14getCurrentTimeEv ## OZScene::getCurrentTime() const
0000000000448583	movq	-0x58(%rbp), %rax
0000000000448587	movq	%rax, -0x30(%rbp)
000000000044858b	movupd	-0x68(%rbp), %xmm0
0000000000448590	movapd	%xmm0, -0x40(%rbp)
0000000000448595	movq	0x208(%r14), %rdi
000000000044859c	leaq	-0x40(%rbp), %rsi
00000000004485a0	callq	__ZN7OZScene15getActiveCameraERK6CMTime ## OZScene::getActiveCamera(CMTime const&)
00000000004485a5	movq	0x208(%r14), %rdi
00000000004485ac	movl	%eax, %esi
00000000004485ae	callq	__ZN7OZScene7getNodeEj          ## OZScene::getNode(unsigned int)
00000000004485b3	testq	%rax, %rax
00000000004485b6	je	0x4486b7
00000000004485bc	leaq	__ZTI11OZSceneNode(%rip), %rsi  ## typeinfo for OZSceneNode
00000000004485c3	leaq	__ZTI8OZCamera(%rip), %rdx      ## typeinfo for OZCamera
00000000004485ca	movq	%rax, %rdi
00000000004485cd	xorl	%ecx, %ecx
00000000004485cf	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
00000000004485d4	testq	%rax, %rax
00000000004485d7	je	0x4486b7
00000000004485dd	movq	%rax, %r15
00000000004485e0	movq	-0x58(%rbp), %rax
00000000004485e4	movq	%rax, -0x30(%rbp)
00000000004485e8	movupd	-0x68(%rbp), %xmm0
00000000004485ed	movapd	%xmm0, -0x40(%rbp)
00000000004485f2	movl	$0x40, %edi
00000000004485f7	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000004485fc	movq	%rax, %r14
00000000004485ff	movq	(%r15), %rax
0000000000448602	movq	%r15, %rdi
0000000000448605	callq	*0x110(%rax)
000000000044860b	movl	0x48(%r15), %ecx
000000000044860f	movq	%r14, %rsi
0000000000448612	addq	$0x30, %rsi
0000000000448616	movq	$0x0, 0x38(%r14)
000000000044861e	leaq	0x41cc63(%rip), %rdx
0000000000448625	movq	%rdx, (%r14)
0000000000448628	leaq	0x41d011(%rip), %rdx
000000000044862f	movq	%rdx, 0x30(%r14)
0000000000448633	movq	%rax, 0x8(%r14)
0000000000448637	movl	%ecx, 0x10(%r14)
000000000044863b	movb	$0x1, 0x14(%r14)
0000000000448640	movq	%r14, -0x50(%rbp)
0000000000448644	leaq	-0x48(%rbp), %r14
0000000000448648	movq	%r14, %rdi
000000000044864b	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
0000000000448650	movq	-0x50(%rbp), %rsi
0000000000448654	testq	%rsi, %rsi
0000000000448657	jne	0x448667
0000000000448659	movl	$0x1, %edi
000000000044865e	callq	0x6dd290                        ## symbol stub for: __Z28throw_PCNullPointerExceptionb
0000000000448663	movq	-0x50(%rbp), %rsi
0000000000448667	movb	$0x0, 0x14(%rsi)
000000000044866b	movapd	-0x40(%rbp), %xmm0
0000000000448670	movupd	%xmm0, 0x18(%rsi)
0000000000448675	movq	-0x30(%rbp), %rax
0000000000448679	movq	%rax, 0x28(%rsi)
000000000044867d	movq	(%rsi), %rax
0000000000448680	leaq	-0x40(%rbp), %rdi
0000000000448684	callq	*0x90(%rax)
000000000044868a	movsd	-0x28(%rbp), %xmm1
000000000044868f	xorpd	%xmm0, %xmm0
0000000000448693	ucomisd	%xmm0, %xmm1
0000000000448697	jne	0x44869b
0000000000448699	jnp	0x4486c9
000000000044869b	movsd	0x2bcd3d(%rip), %xmm0
00000000004486a3	divsd	%xmm1, %xmm0
00000000004486a7	movddup	%xmm0, %xmm1                    ## xmm1 = xmm0[0,0]
00000000004486ab	mulpd	-0x40(%rbp), %xmm1
00000000004486b0	mulsd	-0x30(%rbp), %xmm0
00000000004486b5	jmp	0x4486d3
00000000004486b7	xorpd	%xmm0, %xmm0
00000000004486bb	movupd	%xmm0, (%rbx)
00000000004486bf	movq	$0x0, 0x10(%rbx)
00000000004486c7	jmp	0x4486e4
00000000004486c9	movapd	-0x40(%rbp), %xmm1
00000000004486ce	movsd	-0x30(%rbp), %xmm0
00000000004486d3	movupd	%xmm1, (%rbx)
00000000004486d7	movsd	%xmm0, 0x10(%rbx)
00000000004486dc	movq	%r14, %rdi
00000000004486df	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000004486e4	addq	$0x58, %rsp
00000000004486e8	popq	%rbx
00000000004486e9	popq	%r14
00000000004486eb	popq	%r15
00000000004486ed	popq	%rbp
00000000004486ee	retq
00000000004486ef	jmp	0x4486f1
00000000004486f1	movq	%rax, %rbx
00000000004486f4	movq	%r14, %rdi
00000000004486f7	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000004486fc	movq	%rbx, %rdi
00000000004486ff	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000448704	movq	%rax, %rbx
0000000000448707	movq	%r14, %rdi
000000000044870a	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
000000000044870f	movq	%rbx, %rdi
0000000000448712	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000448717	nopw	(%rax,%rax)

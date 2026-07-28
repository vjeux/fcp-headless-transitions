__ZNK39FFAudioStreamMonitoringAngleObjectScope19IsObjectPlayEnabledEv:
00000000e6a3e0	pushq	%rbp
00000000e6a3e1	movq	%rsp, %rbp
00000000e6a3e4	pushq	%r15
00000000e6a3e6	pushq	%r14
00000000e6a3e8	pushq	%rbx
00000000e6a3e9	pushq	%rax
00000000e6a3ea	movq	%rdi, %rbx
00000000e6a3ed	movq	0x8(%rdi), %rdi
00000000e6a3f1	movq	0xd4e8c0(%rip), %rsi              ## Objc selector ref: container
00000000e6a3f8	movq	0xa832c1(%rip), %r15              ## Objc message: _objc_msgSend
00000000e6a3ff	callq	*%r15                             ## [rdi container]
00000000e6a402	movq	0xd52d0f(%rip), %rsi              ## Objc selector ref: audioAngles
00000000e6a409	movq	%rax, %rdi
00000000e6a40c	callq	*%r15                             ## [container audioAngles]
00000000e6a40f	movq	%rax, %r14                        ## r14 = audioAngles set
00000000e6a412	movq	0x8(%rbx), %rdi                   ## rdi = this->[+0x8] again
00000000e6a416	movq	0xd52d73(%rip), %rsi              ## Objc selector ref: angleID
00000000e6a41d	callq	*%r15                             ## [rdi angleID]  => angleID value
00000000e6a420	movq	0xd4e8a9(%rip), %rsi              ## Objc selector ref: containsObject:
00000000e6a427	movq	%r14, %rdi                        ## rdi = audioAngles
00000000e6a42a	movq	%rax, %rdx                        ## rdx = angleID
00000000e6a42d	callq	*%r15                             ## [audioAngles containsObject:angleID]
00000000e6a430	testb	%al, %al
00000000e6a432	setne	%al                               ## return al != 0
00000000e6a435	addq	$0x8, %rsp
00000000e6a439	popq	%rbx
00000000e6a43a	popq	%r14
00000000e6a43c	popq	%r15
00000000e6a43e	popq	%rbp
00000000e6a43f	retq

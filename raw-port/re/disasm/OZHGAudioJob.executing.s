__ZN12OZHGAudioJob9executingEv:
0000000000636760	pushq	%rbp
0000000000636761	movq	%rsp, %rbp
0000000000636764	pushq	%r15
0000000000636766	pushq	%r14
0000000000636768	pushq	%rbx
0000000000636769	subq	$0x28, %rsp
000000000063676d	movq	%rdi, %rbx
0000000000636770	movq	0x1e9db9(%rip), %rdi            ## literal pool symbol address: _OBJC_CLASS_$_NSAutoreleasePool
0000000000636777	callq	0x6dffb4                        ## symbol stub for: _objc_alloc_init
000000000063677c	movq	%rax, %r14
000000000063677f	movq	0x90(%rbx), %rdi
0000000000636786	testq	%rdi, %rdi
0000000000636789	je	0x63693f
000000000063678f	movl	0x9c(%rbx), %esi
0000000000636795	testl	%esi, %esi
0000000000636797	je	0x636809
0000000000636799	callq	__ZN7OZScene7getNodeEj          ## OZScene::getNode(unsigned int)
000000000063679e	testq	%rax, %rax
00000000006367a1	je	0x63693f
00000000006367a7	leaq	__ZTI11OZSceneNode(%rip), %rsi  ## typeinfo for OZSceneNode
00000000006367ae	leaq	__ZTI12OZAudioTrack(%rip), %rdx ## typeinfo for OZAudioTrack
00000000006367b5	movq	%rax, %rdi
00000000006367b8	xorl	%ecx, %ecx
00000000006367ba	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
00000000006367bf	testq	%rax, %rax
00000000006367c2	je	0x63693f
00000000006367c8	cmpb	$0x1, 0x104(%rbx)
00000000006367cf	jne	0x636893
00000000006367d5	movq	0xa0(%rbx), %r9
00000000006367dc	movq	0xa8(%rbx), %rdx
00000000006367e3	movl	0xd8(%rbx), %ecx
00000000006367e9	movl	0xf0(%rbx), %r8d
00000000006367f0	movsd	0xf8(%rbx), %xmm0
00000000006367f8	leaq	-0x30(%rbp), %rdi
00000000006367fc	movq	%rax, %rsi
00000000006367ff	callq	__ZN12OZAudioTrack13getSampleDataEyjjdP12OZAudioMixer ## OZAudioTrack::getSampleData(unsigned long long, unsigned int, unsigned int, double, OZAudioMixer*)
0000000000636804	jmp	0x6368d2
0000000000636809	movl	0x98(%rbx), %esi
000000000063680f	testl	%esi, %esi
0000000000636811	je	0x63693f
0000000000636817	callq	__ZN7OZScene7getNodeEj          ## OZScene::getNode(unsigned int)
000000000063681c	testq	%rax, %rax
000000000063681f	je	0x63693f
0000000000636825	leaq	__ZTI11OZSceneNode(%rip), %rsi  ## typeinfo for OZSceneNode
000000000063682c	leaq	__ZTI18OZAudioMasterTrack(%rip), %rdx ## typeinfo for OZAudioMasterTrack
0000000000636833	movq	%rax, %rdi
0000000000636836	xorl	%ecx, %ecx
0000000000636838	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
000000000063683d	testq	%rax, %rax
0000000000636840	je	0x63693f
0000000000636846	cmpb	$0x1, 0x104(%rbx)
000000000063684d	jne	0x636893
000000000063684f	movq	0xa0(%rbx), %rsi
0000000000636856	movq	0xa8(%rbx), %rdx
000000000063685d	movl	0xd8(%rbx), %ecx
0000000000636863	movl	0xf0(%rbx), %r8d
000000000063686a	movsd	0xf8(%rbx), %xmm0
0000000000636872	movl	0x100(%rbx), %r9d
0000000000636879	movq	%rsi, (%rsp)
000000000063687d	movl	$0x0, 0x8(%rsp)
0000000000636885	leaq	-0x30(%rbp), %rdi
0000000000636889	movq	%rax, %rsi
000000000063688c	callq	__ZN18OZAudioMasterTrack13getSampleDataEyjjdjP12OZAudioMixerb ## OZAudioMasterTrack::getSampleData(unsigned long long, unsigned int, unsigned int, double, unsigned int, OZAudioMixer*, bool)
0000000000636891	jmp	0x6368d2
0000000000636893	movq	0xa0(%rbx), %rsi
000000000063689a	movq	0xa8(%rbx), %rdx
00000000006368a1	movl	0xd8(%rbx), %ecx
00000000006368a7	movl	0xf0(%rbx), %r8d
00000000006368ae	movsd	0xf8(%rbx), %xmm0
00000000006368b6	movl	0x100(%rbx), %r9d
00000000006368bd	movq	(%rax), %r10
00000000006368c0	movq	%rsi, (%rsp)
00000000006368c4	leaq	-0x30(%rbp), %rdi
00000000006368c8	movq	%rax, %rsi
00000000006368cb	callq	*0x510(%r10)
00000000006368d2	movaps	-0x30(%rbp), %xmm0
00000000006368d6	xorps	%xmm1, %xmm1
00000000006368d9	movaps	%xmm1, -0x30(%rbp)
00000000006368dd	movq	0x110(%rbx), %r15
00000000006368e4	movups	%xmm0, 0x108(%rbx)
00000000006368eb	testq	%r15, %r15
00000000006368ee	je	0x636913
00000000006368f0	movq	$-0x1, %rax
00000000006368f7	lock
00000000006368f8	xaddq	%rax, 0x8(%r15)
00000000006368fd	testq	%rax, %rax
0000000000636900	jne	0x636913
0000000000636902	movq	(%r15), %rax
0000000000636905	movq	%r15, %rdi
0000000000636908	callq	*0x10(%rax)
000000000063690b	movq	%r15, %rdi
000000000063690e	callq	0x6dfbbe                        ## symbol stub for: __ZNSt3__119__shared_weak_count14__release_weakEv
0000000000636913	movq	-0x28(%rbp), %r15
0000000000636917	testq	%r15, %r15
000000000063691a	je	0x63693f
000000000063691c	movq	$-0x1, %rax
0000000000636923	lock
0000000000636924	xaddq	%rax, 0x8(%r15)
0000000000636929	testq	%rax, %rax
000000000063692c	jne	0x63693f
000000000063692e	movq	(%r15), %rax
0000000000636931	movq	%r15, %rdi
0000000000636934	callq	*0x10(%rax)
0000000000636937	movq	%r15, %rdi
000000000063693a	callq	0x6dfbbe                        ## symbol stub for: __ZNSt3__119__shared_weak_count14__release_weakEv
000000000063693f	cmpq	$0x0, 0x108(%rbx)
0000000000636947	je	0x636981
0000000000636949	movzbl	0x50(%rbx), %eax
000000000063694d	leaq	0x2e0b04(%rip), %r15
0000000000636954	testb	%al, %al
0000000000636956	jne	0x63696e
0000000000636958	movq	0x70(%rbx), %rax
000000000063695c	testq	%rax, %rax
000000000063695f	je	0x636967
0000000000636961	callq	*%rax
0000000000636963	testl	%eax, %eax
0000000000636965	jne	0x63696e
0000000000636967	leaq	0x2e0af2(%rip), %r15
000000000063696e	movq	0x80(%rbx), %rdi
0000000000636975	movq	(%r15), %rsi
0000000000636978	movq	%rbx, %rdx
000000000063697b	callq	*0x1ef6a7(%rip)                 ## Objc message: -[%rdi updateMasterTracksArray]
0000000000636981	movq	%r14, %rdi
0000000000636984	callq	*0x1ef6e6(%rip)                 ## literal pool symbol address: _objc_release
000000000063698a	addq	$0x28, %rsp
000000000063698e	popq	%rbx
000000000063698f	popq	%r14
0000000000636991	popq	%r15
0000000000636993	popq	%rbp
0000000000636994	retq
0000000000636995	nopw	%cs:(%rax,%rax)

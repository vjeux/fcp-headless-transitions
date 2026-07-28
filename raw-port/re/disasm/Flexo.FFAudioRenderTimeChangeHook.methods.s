// Extracted from /tmp/Flexo_tV.txt for FFAudioRenderTimeChangeHook.
__ZN27FFAudioRenderTimeChangeHook9PreRenderEjRK14AudioTimeStampjjRK15AudioBufferList:  // @0xd375d0
0000000000d375d0	pushq	%rbp
0000000000d375d1	movq	%rsp, %rbp
0000000000d375d4	pushq	%rbx
0000000000d375d5	pushq	%rax
0000000000d375d6	movl	%r8d, %esi
0000000000d375d9	movq	%rdx, %rbx
0000000000d375dc	movsd	(%rdx), %xmm0
0000000000d375e0	movsd	%xmm0, 0x8(%rdi)
0000000000d375e5	movq	(%rdi), %rax
0000000000d375e8	callq	*0x20(%rax)
0000000000d375eb	movsd	%xmm0, (%rbx)
0000000000d375ef	addq	$0x8, %rsp
0000000000d375f3	popq	%rbx
0000000000d375f4	popq	%rbp
0000000000d375f5	retq
0000000000d375f6	nopw	%cs:(%rax,%rax)
__ZN27FFAudioRenderTimeChangeHook10PostRenderEjRK14AudioTimeStampjjRK15AudioBufferList:  // @0xd37600
0000000000d37600	pushq	%rbp
0000000000d37601	movq	%rsp, %rbp
0000000000d37604	movsd	0x8(%rdi), %xmm0
0000000000d37609	movsd	%xmm0, (%rdx)
0000000000d3760d	popq	%rbp
0000000000d3760e	retq
__ZN27FFAudioRenderTimeChangeHookD1Ev:                                          // @0x14878f0
00000000014878f0	pushq	%rbp
00000000014878f1	movq	%rsp, %rbp
00000000014878f4	ud2
00000000014878f6	nopw	%cs:(%rax,%rax)
__ZN27FFAudioRenderTimeChangeHookD0Ev:                                          // @0x1487900
0000000001487900	pushq	%rbp
0000000001487901	movq	%rsp, %rbp
0000000001487904	ud2
0000000001487906	nopw	%cs:(%rax,%rax)

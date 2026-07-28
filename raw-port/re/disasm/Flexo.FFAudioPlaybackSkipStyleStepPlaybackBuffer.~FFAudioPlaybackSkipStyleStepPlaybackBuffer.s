__ZN42FFAudioPlaybackSkipStyleStepPlaybackBufferD0Ev:
0000000000d113d0	pushq	%rbp
0000000000d113d1	movq	%rsp, %rbp
0000000000d113d4	pushq	%r14
0000000000d113d6	pushq	%rbx
0000000000d113d7	leaq	0xc00282(%rip), %rax
0000000000d113de	movq	%rax, (%rdi)
0000000000d113e1	movq	0x180(%rdi), %rbx
0000000000d113e8	testq	%rbx, %rbx
0000000000d113eb	je	0xd11416
0000000000d113ed	movq	$-0x1, %rax
0000000000d113f4	lock
0000000000d113f5	xaddq	%rax, 0x8(%rbx)
0000000000d113fa	testq	%rax, %rax
0000000000d113fd	jne	0xd11416
0000000000d113ff	movq	(%rbx), %rax
0000000000d11402	movq	%rdi, %r14
0000000000d11405	movq	%rbx, %rdi
0000000000d11408	callq	*0x10(%rax)
0000000000d1140b	movq	%rbx, %rdi
0000000000d1140e	callq	0x1497398                       ## symbol stub for: __ZNSt3__119__shared_weak_count14__release_weakEv
0000000000d11413	movq	%r14, %rdi
0000000000d11416	movq	%rdi, %rbx
0000000000d11419	callq	__ZN30FFAudioPlaybackSkipStyleBufferD2Ev ## FFAudioPlaybackSkipStyleBuffer::~FFAudioPlaybackSkipStyleBuffer()
0000000000d1141e	movq	%rbx, %rdi
0000000000d11421	popq	%rbx
0000000000d11422	popq	%r14
0000000000d11424	popq	%rbp
0000000000d11425	jmp	0x1497404                       ## symbol stub for: __ZdlPv
0000000000d1142a	nopw	(%rax,%rax)

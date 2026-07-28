__ZNK27FFAVFCompositionAudioCursor32createSampleBufferForReadRequestEi24FFMediaReaderRequestMode6CMTimeP14FFPrerollBatch:
0000000000df2310	pushq	%rbp
0000000000df2311	movq	%rsp, %rbp
0000000000df2314	subq	$0x80, %rsp
0000000000df231b	movl	%esi, %r8d
0000000000df231e	movq	0x8(%rdi), %rax
0000000000df2322	movq	0x10(%rdi), %rsi
0000000000df2326	movq	0x18(%rdi), %rdx
0000000000df232a	movups	0x70(%rdi), %xmm0
0000000000df232e	movups	%xmm0, 0x68(%rsp)
0000000000df2333	movups	0x60(%rdi), %xmm0
0000000000df2337	movups	%xmm0, 0x58(%rsp)
0000000000df233c	movups	0x20(%rdi), %xmm0
0000000000df2340	movups	0x30(%rdi), %xmm1
0000000000df2344	movups	0x40(%rdi), %xmm2
0000000000df2348	movups	0x50(%rdi), %xmm3
0000000000df234c	movups	%xmm3, 0x48(%rsp)
0000000000df2351	movups	%xmm2, 0x38(%rsp)
0000000000df2356	movups	%xmm1, 0x28(%rsp)
0000000000df235b	movups	%xmm0, 0x18(%rsp)
0000000000df2360	movq	0x20(%rbp), %rcx
0000000000df2364	movq	%rcx, 0x10(%rsp)
0000000000df2369	movaps	0x10(%rbp), %xmm0
0000000000df236d	movups	%xmm0, (%rsp)
0000000000df2371	movq	%rax, %rdi
0000000000df2374	xorl	%ecx, %ecx
0000000000df2376	callq	__ZNK27FFAVFCompositionMediaReader32createSampleBufferForReadRequestEP14AVSampleCursorP23AVSampleBufferGeneratorbi6CMTime13CMTimeMapping ## FFAVFCompositionMediaReader::createSampleBufferForReadRequest(AVSampleCursor*, AVSampleBufferGenerator*, bool, int, CMTime, CMTimeMapping) const
0000000000df237b	addq	$0x80, %rsp
0000000000df2382	popq	%rbp
0000000000df2383	retq
0000000000df2384	nopw	%cs:(%rax,%rax)

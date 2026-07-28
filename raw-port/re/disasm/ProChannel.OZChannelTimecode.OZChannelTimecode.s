__ZN17OZChannelTimecodeC2EP9OZFactoryRK8PCStringjP13OZChannelImplP13OZChannelInfo:
000000000001140a	pushq	%rbp
000000000001140b	movq	%rsp, %rbp
000000000001140e	pushq	%r15
0000000000011410	pushq	%r14
0000000000011412	pushq	%rbx
0000000000011413	subq	$0x18, %rsp
0000000000011417	movq	%r9, %r15
000000000001141a	movq	%r8, %r14
000000000001141d	movl	%ecx, %r8d
0000000000011420	movq	%rdi, %rbx
0000000000011423	movq	%r9, 0x8(%rsp)
0000000000011428	movq	%r14, (%rsp)
000000000001142c	xorl	%ecx, %ecx
000000000001142e	xorl	%r9d, %r9d
0000000000011431	callq	__ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannel::OZChannel(OZFactory*, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000011436	leaq	__ZTV17OZChannelTimecode(%rip), %rax ## vtable for OZChannelTimecode
000000000001143d	leaq	0x10(%rax), %rcx
0000000000011441	movq	%rcx, (%rbx)
0000000000011444	addq	$0x370, %rax                    ## imm = 0x370
000000000001144a	movq	%rax, 0x10(%rbx)
000000000001144e	callq	__ZN17OZChannelTimecode27createOZChannelTimecodeInfoEv ## OZChannelTimecode::createOZChannelTimecodeInfo()
0000000000011453	testq	%r15, %r15
0000000000011456	je	0x11461
0000000000011458	movq	0x88(%rbx), %rax
000000000001145f	jmp	0x11472
0000000000011461	leaq	__ZN17OZChannelTimecode22_OZChannelTimecodeInfoE(%rip), %rax ## OZChannelTimecode::_OZChannelTimecodeInfo
0000000000011468	movq	(%rax), %rax
000000000001146b	movq	%rax, 0x88(%rbx)
0000000000011472	movq	%rax, 0x80(%rbx)
0000000000011479	callq	__ZN17OZChannelTimecode27createOZChannelTimecodeImplEv ## OZChannelTimecode::createOZChannelTimecodeImpl()
000000000001147e	testq	%r14, %r14
0000000000011481	je	0x11489
0000000000011483	movq	0x78(%rbx), %rax
0000000000011487	jmp	0x11497
0000000000011489	leaq	__ZN17OZChannelTimecode22_OZChannelTimecodeImplE(%rip), %rax ## OZChannelTimecode::_OZChannelTimecodeImpl
0000000000011490	movq	(%rax), %rax
0000000000011493	movq	%rax, 0x78(%rbx)
0000000000011497	movq	%rax, 0x70(%rbx)
000000000001149b	addq	$0x18, %rsp
000000000001149f	popq	%rbx
00000000000114a0	popq	%r14
00000000000114a2	popq	%r15
00000000000114a4	popq	%rbp
00000000000114a5	retq
00000000000114a6	movq	%rax, %r14
00000000000114a9	movq	%rbx, %rdi
00000000000114ac	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
00000000000114b1	movq	%r14, %rdi
00000000000114b4	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
00000000000114b9	nop

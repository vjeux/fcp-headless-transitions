__ZN16OZSceneGamutUndo4SwapEv:
00000000001015d0	pushq	%rbp
00000000001015d1	movq	%rsp, %rbp
00000000001015d4	pushq	%r15
00000000001015d6	pushq	%r14
00000000001015d8	pushq	%r12
00000000001015da	pushq	%rbx
00000000001015db	movq	%rdi, %rbx
00000000001015de	leaq	_theApp(%rip), %rax
00000000001015e5	movq	(%rax), %rdi
00000000001015e8	callq	__ZN13OZApplication13getCurrentDocEv ## OZApplication::getCurrentDoc()
00000000001015ed	movq	0x8(%rax), %r14
00000000001015f1	testq	%r14, %r14
00000000001015f4	je	0x1016a8
00000000001015fa	movq	%r14, %rdi
00000000001015fd	callq	__ZNK7OZScene18getRawWorkingGamutEv ## OZScene::getRawWorkingGamut() const
0000000000101602	movl	%eax, %r15d
0000000000101605	movq	%r14, %rdi
0000000000101608	callq	__ZNK7OZScene27dynamicRangeTrackingEnabledEv ## OZScene::dynamicRangeTrackingEnabled() const
000000000010160d	movl	%eax, %r12d
0000000000101610	movl	0x8(%rbx), %esi
0000000000101613	movq	%r14, %rdi
0000000000101616	callq	__ZN7OZScene18setRawWorkingGamutE19PCWorkingGamutValue ## OZScene::setRawWorkingGamut(PCWorkingGamutValue)
000000000010161b	movzbl	0xc(%rbx), %esi
000000000010161f	movq	%r14, %rdi
0000000000101622	callq	__ZN7OZScene30setDynamicRangeTrackingEnabledEb ## OZScene::setDynamicRangeTrackingEnabled(bool)
0000000000101627	leaq	0x2b8(%r14), %rcx
000000000010162e	movl	0x8(%rbx), %esi
0000000000101631	movzbl	0xc(%rbx), %edx
0000000000101635	movq	%r14, %rdi
0000000000101638	callq	__ZN7OZScene34updateColorChannelsForWorkingGamutE19PCWorkingGamutValuebP15OZChannelFolder ## OZScene::updateColorChannelsForWorkingGamut(PCWorkingGamutValue, bool, OZChannelFolder*)
000000000010163d	movl	%r15d, 0x8(%rbx)
0000000000101641	movb	%r12b, 0xc(%rbx)
0000000000101645	movq	0x588(%r14), %rdi
000000000010164c	movl	$0x1010, %esi                   ## imm = 0x1010
0000000000101651	callq	__ZN10OZDocument16postNotificationEj ## OZDocument::postNotification(unsigned int)
0000000000101656	movq	0x71ef63(%rip), %rdi            ## literal pool symbol address: _OBJC_CLASS_$_NSNotificationCenter
000000000010165d	movq	0x8078b4(%rip), %rsi
0000000000101664	movq	0x7249bd(%rip), %r14            ## Objc message: -[%rdi getCurrentTool]
000000000010166b	callq	*%r14
000000000010166e	movq	%rax, %rbx
0000000000101671	movq	0x71ef40(%rip), %rdi            ## literal pool symbol address: _OBJC_CLASS_$_NSNotification
0000000000101678	leaq	_ColorProcessingModeChangedNotification(%rip), %rax
000000000010167f	movq	(%rax), %rdx
0000000000101682	movq	0x808997(%rip), %rsi
0000000000101689	xorl	%ecx, %ecx
000000000010168b	callq	*%r14
000000000010168e	movq	0x808993(%rip), %rsi
0000000000101695	movq	%rbx, %rdi
0000000000101698	movq	%rax, %rdx
000000000010169b	movq	%r14, %rax
000000000010169e	popq	%rbx
000000000010169f	popq	%r12
00000000001016a1	popq	%r14
00000000001016a3	popq	%r15
00000000001016a5	popq	%rbp
00000000001016a6	jmpq	*%rax
00000000001016a8	popq	%rbx
00000000001016a9	popq	%r12
00000000001016ab	popq	%r14
00000000001016ad	popq	%r15
00000000001016af	popq	%rbp
00000000001016b0	retq
00000000001016b1	nopw	%cs:(%rax,%rax)

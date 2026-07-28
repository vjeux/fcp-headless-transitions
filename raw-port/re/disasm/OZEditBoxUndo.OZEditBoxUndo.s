__ZN13OZEditBoxUndoC1EP6NSViewRKNSt3__16vectorIP13OZChannelBaseNS2_9allocatorIS5_EEEEP20OZCurveSelectionList:
0000000000102440	pushq	%rbp
0000000000102441	movq	%rsp, %rbp
0000000000102444	pushq	%r14
0000000000102446	pushq	%rbx
0000000000102447	subq	$0x20, %rsp
000000000010244b	movq	%rdi, %rbx
000000000010244e	callq	__ZN26OZKeypointModificationUndoC2EP6NSViewRKNSt3__16vectorIP13OZChannelBaseNS2_9allocatorIS5_EEEEP20OZCurveSelectionList ## OZKeypointModificationUndo::OZKeypointModificationUndo(NSView*, std::__1::vector<OZChannelBase*, std::__1::allocator<OZChannelBase*>> const&, OZCurveSelectionList*)
0000000000102453	leaq	0x73b296(%rip), %rax
000000000010245a	movq	%rax, (%rbx)
000000000010245d	xorps	%xmm0, %xmm0
0000000000102460	movups	%xmm0, 0x30(%rbx)
0000000000102464	movaps	0x602f55(%rip), %xmm1
000000000010246b	movups	%xmm1, 0x40(%rbx)
000000000010246f	movq	0x8(%rbx), %rsi
0000000000102473	xorps	%xmm1, %xmm1
0000000000102476	testq	%rsi, %rsi
0000000000102479	je	0x102493
000000000010247b	movq	0x807c06(%rip), %rdx
0000000000102482	leaq	-0x30(%rbp), %rdi
0000000000102486	callq	0x6e000e                        ## symbol stub for: _objc_msgSend_stret
000000000010248b	movaps	-0x30(%rbp), %xmm0
000000000010248f	movaps	-0x20(%rbp), %xmm1
0000000000102493	movups	%xmm0, 0x30(%rbx)
0000000000102497	movups	%xmm1, 0x40(%rbx)
000000000010249b	addq	$0x20, %rsp
000000000010249f	popq	%rbx
00000000001024a0	popq	%r14
00000000001024a2	popq	%rbp
00000000001024a3	retq
00000000001024a4	movq	%rax, %r14
00000000001024a7	movq	%rbx, %rdi
00000000001024aa	callq	__ZN26OZKeypointModificationUndoD2Ev ## OZKeypointModificationUndo::~OZKeypointModificationUndo()
00000000001024af	movq	%r14, %rdi
00000000001024b2	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000001024b7	nopw	(%rax,%rax)

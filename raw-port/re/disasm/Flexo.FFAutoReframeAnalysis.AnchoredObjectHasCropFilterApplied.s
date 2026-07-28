__ZN21FFAutoReframeAnalysis34AnchoredObjectHasCropFilterAppliedEP16FFAnchoredObject:
00000000013103f0	pushq	%rbp
00000000013103f1	movq	%rsp, %rbp
00000000013103f4	pushq	%r14
00000000013103f6	pushq	%rbx
00000000013103f7	movq	0x8aab9a(%rip), %rsi
00000000013103fe	movq	0x5dd2bb(%rip), %rbx            ## Objc message: -[%rdi arranged]
0000000001310405	callq	*%rbx
0000000001310407	leaq	_FFCropFilterIDKey(%rip), %rcx
000000000131040e	movq	(%rcx), %rdx
0000000001310411	movq	0x8adc78(%rip), %rsi
0000000001310418	xorl	%r14d, %r14d
000000000131041b	movq	%rax, %rdi
000000000131041e	xorl	%ecx, %ecx
0000000001310420	callq	*%rbx
0000000001310422	movq	%rax, %rbx
0000000001310425	leaq	_OBJC_CLASS_$_FFHeCropEffect(%rip), %rdi
000000000131042c	callq	0x149798c                       ## symbol stub for: _objc_opt_class
0000000001310431	testq	%rbx, %rbx
0000000001310434	je	0x1310460
0000000001310436	movq	%rbx, %rdi
0000000001310439	movq	%rax, %rsi
000000000131043c	callq	0x1497992                       ## symbol stub for: _objc_opt_isKindOfClass
0000000001310441	testb	%al, %al
0000000001310443	je	0x131045d
0000000001310445	movq	0x8aae04(%rip), %rsi
000000000131044c	movq	%rbx, %rdi
000000000131044f	callq	*0x5dd26b(%rip)                 ## Objc message: -[%rdi arranged]
0000000001310455	testb	%al, %al
0000000001310457	sete	%r14b
000000000131045b	jmp	0x1310460
000000000131045d	xorl	%r14d, %r14d
0000000001310460	movzbl	%r14b, %eax
0000000001310464	popq	%rbx
0000000001310465	popq	%r14
0000000001310467	popq	%rbp
0000000001310468	retq
0000000001310469	nopl	(%rax)

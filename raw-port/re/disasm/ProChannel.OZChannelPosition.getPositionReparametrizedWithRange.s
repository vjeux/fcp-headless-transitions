__ZN17OZChannelPosition34getPositionReparametrizedWithRangeERK6CMTimedPdS3_S3_:
0000000000076346	pushq	%rbp
0000000000076347	movq	%rsp, %rbp
000000000007634a	movq	%r8, %rax
000000000007634d	xorl	%r8d, %r8d
0000000000076350	xorl	%r9d, %r9d
0000000000076353	pushq	$0x0
0000000000076355	pushq	%rax
0000000000076356	callq	__ZN17OZChannelPosition17getPositionOnPathERK6CMTimedPdS3_S3_S3_S3_P14PCMatrix44TmplIdE ## OZChannelPosition::getPositionOnPath(CMTime const&, double, double*, double*, double*, double*, double*, PCMatrix44Tmpl<double>*)
000000000007635b	addq	$0x10, %rsp
000000000007635f	popq	%rbp
0000000000076360	retq
0000000000076361	nop

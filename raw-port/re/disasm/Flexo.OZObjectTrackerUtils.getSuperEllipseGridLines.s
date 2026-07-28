__ZN20OZObjectTrackerUtils24getSuperEllipseGridLinesERK6CMTimeR14PCMatrix44TmplIdER9PCVector2IdES8_S8_dd:
0000000000cb3970	pushq	%rbp
0000000000cb3971	movq	%rsp, %rbp
0000000000cb3974	pushq	%r15
0000000000cb3976	pushq	%r14
0000000000cb3978	pushq	%rbx
0000000000cb3979	subq	$0x28, %rsp
0000000000cb397d	movq	%r9, %r14
0000000000cb3980	movq	%rdx, %r15
0000000000cb3983	movq	%rdi, %rbx
0000000000cb3986	xorps	%xmm2, %xmm2
0000000000cb3989	movups	%xmm2, (%rdi)
0000000000cb398c	movq	$0x0, 0x10(%rdi)
0000000000cb3994	movapd	0x8b90f4(%rip), %xmm2
0000000000cb399c	andpd	%xmm0, %xmm2
0000000000cb39a0	movsd	0x8bac40(%rip), %xmm3
0000000000cb39a8	ucomisd	%xmm2, %xmm3
0000000000cb39ac	jbe	0xcb3a34
0000000000cb39b2	movsd	(%rcx), %xmm3
0000000000cb39b6	movsd	0x8(%rcx), %xmm2
0000000000cb39bb	addsd	%xmm2, %xmm2
0000000000cb39bf	movapd	0x8b90c9(%rip), %xmm0
0000000000cb39c7	andpd	%xmm0, %xmm2
0000000000cb39cb	addsd	%xmm3, %xmm3
0000000000cb39cf	andpd	%xmm0, %xmm3
0000000000cb39d3	movsd	0x8b905d(%rip), %xmm0
0000000000cb39db	mulsd	%xmm0, %xmm3
0000000000cb39df	mulsd	%xmm0, %xmm2
0000000000cb39e3	movsd	0x8bc75d(%rip), %xmm0
0000000000cb39eb	divsd	%xmm1, %xmm0
0000000000cb39ef	movq	%rbx, %rdi
0000000000cb39f2	movq	%r15, %rsi
0000000000cb39f5	movq	%r14, %rdx
0000000000cb39f8	movapd	%xmm3, -0x40(%rbp)
0000000000cb39fd	movapd	%xmm3, %xmm1
0000000000cb3a01	movapd	%xmm2, -0x30(%rbp)
0000000000cb3a06	movl	$0x1, %ecx
0000000000cb3a0b	callq	__ZN20OZObjectTrackerUtils26generateRectangleGridLinesERNSt3__16vectorINS0_4pairI9PCVector2IdES4_EENS0_9allocatorIS5_EEEER14PCMatrix44TmplIdERKS4_dddb ## OZObjectTrackerUtils::generateRectangleGridLines(std::__1::vector<std::__1::pair<PCVector2<double>, PCVector2<double>>, std::__1::allocator<std::__1::pair<PCVector2<double>, PCVector2<double>>>>&, PCMatrix44Tmpl<double>&, PCVector2<double> const&, double, double, double, bool)
0000000000cb3a10	movsd	0x8bc730(%rip), %xmm0
0000000000cb3a18	movq	%rbx, %rdi
0000000000cb3a1b	movq	%r15, %rsi
0000000000cb3a1e	movq	%r14, %rdx
0000000000cb3a21	movapd	-0x30(%rbp), %xmm1
0000000000cb3a26	movapd	-0x40(%rbp), %xmm2
0000000000cb3a2b	xorl	%ecx, %ecx
0000000000cb3a2d	callq	__ZN20OZObjectTrackerUtils26generateRectangleGridLinesERNSt3__16vectorINS0_4pairI9PCVector2IdES4_EENS0_9allocatorIS5_EEEER14PCMatrix44TmplIdERKS4_dddb ## OZObjectTrackerUtils::generateRectangleGridLines(std::__1::vector<std::__1::pair<PCVector2<double>, PCVector2<double>>, std::__1::allocator<std::__1::pair<PCVector2<double>, PCVector2<double>>>>&, PCMatrix44Tmpl<double>&, PCVector2<double> const&, double, double, double, bool)
0000000000cb3a32	jmp	0xcb3a50
0000000000cb3a34	movsd	0x8bc70c(%rip), %xmm2
0000000000cb3a3c	movq	%rbx, %rdi
0000000000cb3a3f	movq	%r15, %rsi
0000000000cb3a42	movq	%rcx, %rdx
0000000000cb3a45	movq	%r8, %rcx
0000000000cb3a48	movq	%r14, %r8
0000000000cb3a4b	callq	__ZN20OZObjectTrackerUtils24generateSuperEllipseGridERNSt3__16vectorINS0_4pairI9PCVector2IdES4_EENS0_9allocatorIS5_EEEER14PCMatrix44TmplIdERKS4_SE_SE_ddd ## OZObjectTrackerUtils::generateSuperEllipseGrid(std::__1::vector<std::__1::pair<PCVector2<double>, PCVector2<double>>, std::__1::allocator<std::__1::pair<PCVector2<double>, PCVector2<double>>>>&, PCMatrix44Tmpl<double>&, PCVector2<double> const&, PCVector2<double> const&, PCVector2<double> const&, double, double, double)
0000000000cb3a50	movq	%rbx, %rax
0000000000cb3a53	addq	$0x28, %rsp
0000000000cb3a57	popq	%rbx
0000000000cb3a58	popq	%r14
0000000000cb3a5a	popq	%r15
0000000000cb3a5c	popq	%rbp
0000000000cb3a5d	retq
0000000000cb3a5e	movq	%rax, %r14
0000000000cb3a61	movq	(%rbx), %rdi
0000000000cb3a64	testq	%rdi, %rdi
0000000000cb3a67	je	0xcb3a72
0000000000cb3a69	movq	%rdi, 0x8(%rbx)
0000000000cb3a6d	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000000cb3a72	movq	%r14, %rdi
0000000000cb3a75	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000000cb3a7a	nopw	(%rax,%rax)

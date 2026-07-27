
/tmp/ProChannel.x86_64:	file format mach-o 64-bit x86-64

Disassembly of section __TEXT,__text:

00000000000407e6 <__ZN20OZBezierInterpolator11interpolateER8OZSplineRK6CMTimePvS5_S4_bb>:
   407e6: 55                           	pushq	%rbp
   407e7: 48 89 e5                     	movq	%rsp, %rbp
   407ea: 41 57                        	pushq	%r15
   407ec: 41 56                        	pushq	%r14
   407ee: 41 55                        	pushq	%r13
   407f0: 41 54                        	pushq	%r12
   407f2: 53                           	pushq	%rbx
   407f3: 48 81 ec 48 01 00 00         	subq	$0x148, %rsp            ## imm = 0x148
   407fa: 4c 89 cb                     	movq	%r9, %rbx
   407fd: 48 89 d0                     	movq	%rdx, %rax
   40800: 49 89 f6                     	movq	%rsi, %r14
   40803: 49 89 ff                     	movq	%rdi, %r15
   40806: 48 8b 15 cb 9e 08 00         	movq	0x89ecb(%rip), %rdx     ## 0xca6d8 <_tan+0xca6d8>
   4080d: 48 8b 12                     	movq	(%rdx), %rdx
   40810: 48 89 55 d0                  	movq	%rdx, -0x30(%rbp)
   40814: 48 8d 55 90                  	leaq	-0x70(%rbp), %rdx
   40818: 48 89 54 24 10               	movq	%rdx, 0x10(%rsp)
   4081d: 48 8d 55 b0                  	leaq	-0x50(%rbp), %rdx
   40821: 48 89 54 24 08               	movq	%rdx, 0x8(%rsp)
   40826: 4c 8d ad e0 fe ff ff         	leaq	-0x120(%rbp), %r13
   4082d: 4c 89 2c 24                  	movq	%r13, (%rsp)
   40831: 4c 8d a5 c8 fe ff ff         	leaq	-0x138(%rbp), %r12
   40838: 48 89 ca                     	movq	%rcx, %rdx
   4083b: 4c 89 c1                     	movq	%r8, %rcx
   4083e: 49 89 c0                     	movq	%rax, %r8
   40841: 4d 89 e1                     	movq	%r12, %r9
   40844: e8 01 fd ff ff               	callq	0x4054a <__ZN20OZBezierInterpolator16getControlPointsER8OZSplinePvS2_RK6CMTimeRS3_S6_PdS7_>
   40849: 48 8b 43 10                  	movq	0x10(%rbx), %rax
   4084d: 48 89 85 70 ff ff ff         	movq	%rax, -0x90(%rbp)
   40854: 0f 10 03                     	movups	(%rbx), %xmm0
   40857: 0f 29 85 60 ff ff ff         	movaps	%xmm0, -0xa0(%rbp)
   4085e: 49 8b 44 24 10               	movq	0x10(%r12), %rax
   40863: 48 89 44 24 28               	movq	%rax, 0x28(%rsp)
   40868: 41 0f 10 04 24               	movups	(%r12), %xmm0
   4086d: 0f 11 44 24 18               	movups	%xmm0, 0x18(%rsp)
   40872: 49 8b 45 10                  	movq	0x10(%r13), %rax
   40876: 48 89 44 24 10               	movq	%rax, 0x10(%rsp)
   4087b: 41 0f 10 45 00               	movups	(%r13), %xmm0
   40880: 0f 11 04 24                  	movups	%xmm0, (%rsp)
   40884: 4c 8d ad 40 ff ff ff         	leaq	-0xc0(%rbp), %r13
   4088b: 4c 89 ef                     	movq	%r13, %rdi
   4088e: e8 47 c2 06 00               	callq	0xacada <_tan+0xacada>
   40893: 49 8b 45 10                  	movq	0x10(%r13), %rax
   40897: 48 89 44 24 10               	movq	%rax, 0x10(%rsp)
   4089c: 41 0f 10 45 00               	movups	(%r13), %xmm0
   408a1: 0f 11 04 24                  	movups	%xmm0, (%rsp)
   408a5: e8 e2 c1 06 00               	callq	0xaca8c <_tan+0xaca8c>
   408aa: f2 0f 11 45 88               	movsd	%xmm0, -0x78(%rbp)
   408af: 49 8b 44 24 10               	movq	0x10(%r12), %rax
   408b4: 48 89 44 24 28               	movq	%rax, 0x28(%rsp)
   408b9: 41 0f 10 04 24               	movups	(%r12), %xmm0
   408be: 0f 11 44 24 18               	movups	%xmm0, 0x18(%rsp)
   408c3: 48 8b 85 70 ff ff ff         	movq	-0x90(%rbp), %rax
   408ca: 48 89 44 24 10               	movq	%rax, 0x10(%rsp)
   408cf: 0f 28 85 60 ff ff ff         	movaps	-0xa0(%rbp), %xmm0
   408d6: 0f 11 04 24                  	movups	%xmm0, (%rsp)
   408da: 4c 8d a5 40 ff ff ff         	leaq	-0xc0(%rbp), %r12
   408e1: 4c 89 e7                     	movq	%r12, %rdi
   408e4: e8 f1 c1 06 00               	callq	0xacada <_tan+0xacada>
   408e9: 49 8b 44 24 10               	movq	0x10(%r12), %rax
   408ee: 48 89 44 24 10               	movq	%rax, 0x10(%rsp)
   408f3: 66 41 0f 10 04 24            	movupd	(%r12), %xmm0
   408f9: 66 0f 11 04 24               	movupd	%xmm0, (%rsp)
   408fe: e8 89 c1 06 00               	callq	0xaca8c <_tan+0xaca8c>
   40903: 80 7d 18 00                  	cmpb	$0x0, 0x18(%rbp)
   40907: 0f 84 b3 01 00 00            	je	0x40ac0 <__ZN20OZBezierInterpolator11interpolateER8OZSplineRK6CMTimePvS5_S4_bb+0x2da>
   4090d: 4c 8d a5 28 ff ff ff         	leaq	-0xd8(%rbp), %r12
   40914: be 01 00 00 00               	movl	$0x1, %esi
   40919: 4c 89 e7                     	movq	%r12, %rdi
   4091c: ba e8 03 00 00               	movl	$0x3e8, %edx            ## imm = 0x3E8
   40921: e8 6c c1 06 00               	callq	0xaca92 <_tan+0xaca92>
   40926: 48 8b 43 10                  	movq	0x10(%rbx), %rax
   4092a: 4c 8d bd 40 ff ff ff         	leaq	-0xc0(%rbp), %r15
   40931: 49 89 47 10                  	movq	%rax, 0x10(%r15)
   40935: 0f 10 03                     	movups	(%rbx), %xmm0
   40938: 41 0f 29 07                  	movaps	%xmm0, (%r15)
   4093c: 49 8b 44 24 10               	movq	0x10(%r12), %rax
   40941: 48 89 44 24 28               	movq	%rax, 0x28(%rsp)
   40946: 41 0f 10 04 24               	movups	(%r12), %xmm0
   4094b: 0f 11 44 24 18               	movups	%xmm0, 0x18(%rsp)
   40950: 49 8b 47 10                  	movq	0x10(%r15), %rax
   40954: 48 89 44 24 10               	movq	%rax, 0x10(%rsp)
   40959: 41 0f 28 07                  	movaps	(%r15), %xmm0
   4095d: 0f 11 04 24                  	movups	%xmm0, (%rsp)
   40961: 48 8d bd 10 ff ff ff         	leaq	-0xf0(%rbp), %rdi
   40968: e8 6d c1 06 00               	callq	0xacada <_tan+0xacada>
   4096d: 4c 8d ad f8 fe ff ff         	leaq	-0x108(%rbp), %r13
   40974: be 01 00 00 00               	movl	$0x1, %esi
   40979: 4c 89 ef                     	movq	%r13, %rdi
   4097c: ba e8 03 00 00               	movl	$0x3e8, %edx            ## imm = 0x3E8
   40981: e8 0c c1 06 00               	callq	0xaca92 <_tan+0xaca92>
   40986: 48 8b 43 10                  	movq	0x10(%rbx), %rax
   4098a: 49 89 47 10                  	movq	%rax, 0x10(%r15)
   4098e: 0f 10 03                     	movups	(%rbx), %xmm0
   40991: 41 0f 29 07                  	movaps	%xmm0, (%r15)
   40995: 49 8b 45 10                  	movq	0x10(%r13), %rax
   40999: 48 89 44 24 28               	movq	%rax, 0x28(%rsp)
   4099e: 41 0f 10 45 00               	movups	(%r13), %xmm0
   409a3: 0f 11 44 24 18               	movups	%xmm0, 0x18(%rsp)
   409a8: 49 8b 47 10                  	movq	0x10(%r15), %rax
   409ac: 48 89 44 24 10               	movq	%rax, 0x10(%rsp)
   409b1: 41 0f 28 07                  	movaps	(%r15), %xmm0
   409b5: 0f 11 04 24                  	movups	%xmm0, (%rsp)
   409b9: 4c 8d ad 28 ff ff ff         	leaq	-0xd8(%rbp), %r13
   409c0: 4c 89 ef                     	movq	%r13, %rdi
   409c3: e8 0c c1 06 00               	callq	0xacad4 <_tan+0xacad4>
   409c8: 49 8b 06                     	movq	(%r14), %rax
   409cb: 4c 8b 25 ee 9a 08 00         	movq	0x89aee(%rip), %r12     ## 0xca4c0 <_tan+0xca4c0>
   409d2: 4c 89 f7                     	movq	%r14, %rdi
   409d5: 48 8d b5 10 ff ff ff         	leaq	-0xf0(%rbp), %rsi
   409dc: 4c 89 e2                     	movq	%r12, %rdx
   409df: 31 c9                        	xorl	%ecx, %ecx
   409e1: ff 90 f0 00 00 00            	callq	*0xf0(%rax)
   409e7: f2 0f 11 45 88               	movsd	%xmm0, -0x78(%rbp)
   409ec: 49 8b 06                     	movq	(%r14), %rax
   409ef: 4c 89 f7                     	movq	%r14, %rdi
   409f2: 4c 89 ee                     	movq	%r13, %rsi
   409f5: 4c 89 e2                     	movq	%r12, %rdx
   409f8: 31 c9                        	xorl	%ecx, %ecx
   409fa: ff 90 f0 00 00 00            	callq	*0xf0(%rax)
   40a00: f2 0f 11 45 80               	movsd	%xmm0, -0x80(%rbp)
   40a05: 4c 89 ff                     	movq	%r15, %rdi
   40a08: 4c 89 f6                     	movq	%r14, %rsi
   40a0b: 4c 89 e2                     	movq	%r12, %rdx
   40a0e: 31 c9                        	xorl	%ecx, %ecx
   40a10: e8 69 d1 fe ff               	callq	0x2db7e <__ZN8OZSpline12getMinValueUERK6CMTimeb>
   40a15: 49 8b 47 10                  	movq	0x10(%r15), %rax
   40a19: 48 89 44 24 28               	movq	%rax, 0x28(%rsp)
   40a1e: 41 0f 10 07                  	movups	(%r15), %xmm0
   40a22: 0f 11 44 24 18               	movups	%xmm0, 0x18(%rsp)
   40a27: 48 8d 8d 10 ff ff ff         	leaq	-0xf0(%rbp), %rcx
   40a2e: 48 8b 41 10                  	movq	0x10(%rcx), %rax
   40a32: 48 89 44 24 10               	movq	%rax, 0x10(%rsp)
   40a37: 66 0f 10 01                  	movupd	(%rcx), %xmm0
   40a3b: 66 0f 11 04 24               	movupd	%xmm0, (%rsp)
   40a40: e8 3b c0 06 00               	callq	0xaca80 <_tan+0xaca80>
   40a45: 85 c0                        	testl	%eax, %eax
   40a47: 0f 88 a2 00 00 00            	js	0x40aef <__ZN20OZBezierInterpolator11interpolateER8OZSplineRK6CMTimePvS5_S4_bb+0x309>
   40a4d: 48 8b 15 6c 9a 08 00         	movq	0x89a6c(%rip), %rdx     ## 0xca4c0 <_tan+0xca4c0>
   40a54: 4c 89 ff                     	movq	%r15, %rdi
   40a57: 4c 89 f6                     	movq	%r14, %rsi
   40a5a: 31 c9                        	xorl	%ecx, %ecx
   40a5c: e8 e3 cf fe ff               	callq	0x2da44 <__ZN8OZSpline12getMaxValueUERK6CMTimeb>
   40a61: 49 8b 47 10                  	movq	0x10(%r15), %rax
   40a65: 48 89 44 24 28               	movq	%rax, 0x28(%rsp)
   40a6a: 41 0f 10 07                  	movups	(%r15), %xmm0
   40a6e: 0f 11 44 24 18               	movups	%xmm0, 0x18(%rsp)
   40a73: 48 8b 85 38 ff ff ff         	movq	-0xc8(%rbp), %rax
   40a7a: 48 89 44 24 10               	movq	%rax, 0x10(%rsp)
   40a7f: 66 0f 10 85 28 ff ff ff      	movupd	-0xd8(%rbp), %xmm0
   40a87: 66 0f 11 04 24               	movupd	%xmm0, (%rsp)
   40a8c: e8 ef bf 06 00               	callq	0xaca80 <_tan+0xaca80>
   40a91: 85 c0                        	testl	%eax, %eax
   40a93: 0f 8e 85 00 00 00            	jle	0x40b1e <__ZN20OZBezierInterpolator11interpolateER8OZSplineRK6CMTimePvS5_S4_bb+0x338>
   40a99: 49 8b 06                     	movq	(%r14), %rax
   40a9c: 48 8b 15 1d 9a 08 00         	movq	0x89a1d(%rip), %rdx     ## 0xca4c0 <_tan+0xca4c0>
   40aa3: 4c 89 f7                     	movq	%r14, %rdi
   40aa6: 48 89 de                     	movq	%rbx, %rsi
   40aa9: 31 c9                        	xorl	%ecx, %ecx
   40aab: ff 90 f0 00 00 00            	callq	*0xf0(%rax)
   40ab1: f2 0f 5c 45 88               	subsd	-0x78(%rbp), %xmm0
   40ab6: f2 0f 5e 05 5a fa 06 00      	divsd	0x6fa5a(%rip), %xmm0    ## 0xb0518 <__ZTSN12_GLOBAL__N_119MinMaxValuesVisitorE+0x30>
   40abe: eb 70                        	jmp	0x40b30 <__ZN20OZBezierInterpolator11interpolateER8OZSplineRK6CMTimePvS5_S4_bb+0x34a>
   40ac0: f2 0f 10 0d a8 fc 06 00      	movsd	0x6fca8(%rip), %xmm1    ## 0xb0770 <__ZTS8OZVertex+0xc>
   40ac8: f2 0f 5f 4d 88               	maxsd	-0x78(%rbp), %xmm1
   40acd: f2 0f 5e c1                  	divsd	%xmm1, %xmm0
   40ad1: 80 7d 10 00                  	cmpb	$0x0, 0x10(%rbp)
   40ad5: 75 09                        	jne	0x40ae0 <__ZN20OZBezierInterpolator11interpolateER8OZSplineRK6CMTimePvS5_S4_bb+0x2fa>
   40ad7: 48 8d 7d b0                  	leaq	-0x50(%rbp), %rdi
   40adb: e8 e7 4c 06 00               	callq	0xa57c7 <__Z21OZBezierFindParameterPKdd>
   40ae0: 49 8b 07                     	movq	(%r15), %rax
   40ae3: 48 8d 75 90                  	leaq	-0x70(%rbp), %rsi
   40ae7: 4c 89 ff                     	movq	%r15, %rdi
   40aea: ff 50 70                     	callq	*0x70(%rax)
   40aed: eb 41                        	jmp	0x40b30 <__ZN20OZBezierInterpolator11interpolateER8OZSplineRK6CMTimePvS5_S4_bb+0x34a>
   40aef: 49 8b 06                     	movq	(%r14), %rax
   40af2: 48 8b 15 c7 99 08 00         	movq	0x899c7(%rip), %rdx     ## 0xca4c0 <_tan+0xca4c0>
   40af9: 4c 89 f7                     	movq	%r14, %rdi
   40afc: 48 89 de                     	movq	%rbx, %rsi
   40aff: 31 c9                        	xorl	%ecx, %ecx
   40b01: ff 90 f0 00 00 00            	callq	*0xf0(%rax)
   40b07: f2 0f 10 4d 80               	movsd	-0x80(%rbp), %xmm1
   40b0c: f2 0f 5c c8                  	subsd	%xmm0, %xmm1
   40b10: f2 0f 5e 0d 00 fa 06 00      	divsd	0x6fa00(%rip), %xmm1    ## 0xb0518 <__ZTSN12_GLOBAL__N_119MinMaxValuesVisitorE+0x30>
   40b18: 66 0f 28 c1                  	movapd	%xmm1, %xmm0
   40b1c: eb 12                        	jmp	0x40b30 <__ZN20OZBezierInterpolator11interpolateER8OZSplineRK6CMTimePvS5_S4_bb+0x34a>
   40b1e: f2 0f 10 45 80               	movsd	-0x80(%rbp), %xmm0
   40b23: f2 0f 5c 45 88               	subsd	-0x78(%rbp), %xmm0
   40b28: f2 0f 5e 05 48 fc 06 00      	divsd	0x6fc48(%rip), %xmm0    ## 0xb0778 <__ZTS8OZVertex+0x14>
   40b30: 48 8b 05 a1 9b 08 00         	movq	0x89ba1(%rip), %rax     ## 0xca6d8 <_tan+0xca6d8>
   40b37: 48 8b 00                     	movq	(%rax), %rax
   40b3a: 48 3b 45 d0                  	cmpq	-0x30(%rbp), %rax
   40b3e: 75 12                        	jne	0x40b52 <__ZN20OZBezierInterpolator11interpolateER8OZSplineRK6CMTimePvS5_S4_bb+0x36c>
   40b40: 48 81 c4 48 01 00 00         	addq	$0x148, %rsp            ## imm = 0x148
   40b47: 5b                           	popq	%rbx
   40b48: 41 5c                        	popq	%r12
   40b4a: 41 5d                        	popq	%r13
   40b4c: 41 5e                        	popq	%r14
   40b4e: 41 5f                        	popq	%r15
   40b50: 5d                           	popq	%rbp
   40b51: c3                           	retq
   40b52: e8 55 c3 06 00               	callq	0xaceac <_tan+0xaceac>
   40b57: 90                           	nop
